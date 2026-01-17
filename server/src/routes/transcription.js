import express from 'express';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { WebSocketServer } from 'ws';

const router = express.Router();

// Lazy initialize DeepGram client (to allow .env to be loaded first)
let deepgramClient = null;

function getDeepgramClient() {
    if (!deepgramClient && process.env.DEEPGRAM_API_KEY) {
        deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);
    }
    return deepgramClient;
}

// @route   GET /api/transcription/token
// @desc    Get a temporary token for client-side transcription
// @access  Public
router.get('/token', async (req, res) => {
    try {
        const hasApiKey = !!process.env.DEEPGRAM_API_KEY;
        res.json({
            success: true,
            configured: hasApiKey,
            message: hasApiKey
                ? 'Use WebSocket connection for transcription'
                : 'Transcription not configured - missing API key',
            wsUrl: hasApiKey
                ? `${process.env.NODE_ENV === 'production' ? 'wss' : 'ws'}://${req.get('host')}/transcribe`
                : null
        });
    } catch (error) {
        console.error('Token generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate transcription token'
        });
    }
});

// @route   POST /api/transcription/transcribe-audio
// @desc    Transcribe pre-recorded audio file
// @access  Public
router.post('/transcribe-audio', async (req, res) => {
    try {
        const client = getDeepgramClient();
        if (!client) {
            return res.status(503).json({
                success: false,
                error: 'Transcription service not configured'
            });
        }

        const { audioUrl, audioBase64, mimeType = 'audio/wav' } = req.body;

        if (!audioUrl && !audioBase64) {
            return res.status(400).json({
                success: false,
                error: 'Audio URL or base64 data required'
            });
        }

        let transcriptionResult;

        if (audioUrl) {
            // Transcribe from URL
            const { result, error } = await client.listen.prerecorded.transcribeUrl(
                { url: audioUrl },
                {
                    model: 'nova-2-medical',
                    smart_format: true,
                    punctuate: true,
                    diarize: true
                }
            );

            if (error) throw error;
            transcriptionResult = result;
        } else {
            // Transcribe from base64
            const audioBuffer = Buffer.from(audioBase64, 'base64');
            const { result, error } = await client.listen.prerecorded.transcribeFile(
                audioBuffer,
                {
                    model: 'nova-2-medical',
                    smart_format: true,
                    punctuate: true,
                    mimetype: mimeType
                }
            );

            if (error) throw error;
            transcriptionResult = result;
        }

        const transcript = transcriptionResult.results?.channels[0]?.alternatives[0]?.transcript || '';

        res.json({
            success: true,
            transcript: transcript,
            confidence: transcriptionResult.results?.channels[0]?.alternatives[0]?.confidence || 0,
            words: transcriptionResult.results?.channels[0]?.alternatives[0]?.words || []
        });

    } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({
            success: false,
            error: 'Transcription failed',
            details: error.message
        });
    }
});

// @route   GET /api/transcription/languages
// @desc    Get supported languages
// @access  Public
router.get('/languages', (req, res) => {
    res.json({
        success: true,
        languages: [
            { code: 'en', name: 'English', variants: ['en-US', 'en-GB', 'en-IN'] },
            { code: 'hi', name: 'Hindi', variants: ['hi-IN'] },
            { code: 'es', name: 'Spanish', variants: ['es-ES', 'es-MX'] },
            { code: 'fr', name: 'French', variants: ['fr-FR'] }
        ],
        defaultModel: 'nova-2-medical'
    });
});

// @route   GET /api/transcription/health
// @desc    Check DeepGram connection health
// @access  Public
router.get('/health', async (req, res) => {
    try {
        const hasApiKey = !!process.env.DEEPGRAM_API_KEY;

        res.json({
            success: true,
            status: hasApiKey ? 'connected' : 'no_api_key',
            provider: 'DeepGram',
            models: ['nova-2', 'nova-2-medical', 'whisper']
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'error',
            error: error.message
        });
    }
});

// Export function to setup WebSocket for live transcription (Socket.io version)
export function setupTranscriptionWebSocket(io) {
    // Check if API key is configured
    if (!process.env.DEEPGRAM_API_KEY) {
        console.log('⚠️ DeepGram API key not configured - transcription disabled');
        return null;
    }

    const transcriptionNamespace = io.of('/transcription');

    transcriptionNamespace.on('connection', (socket) => {
        console.log('New transcription socket connected:', socket.id);

        let deepgramLive = null;
        const client = getDeepgramClient();

        if (!client) {
            socket.emit('error', { message: 'Transcription service not available' });
            return;
        }

        // Start DeepGram stream when client requests
        socket.on('start-stream', () => {
            try {
                console.log('🎙️ Starting DeepGram live transcription...');
                // Config for raw PCM audio (linear16 from Web Audio API)
                deepgramLive = client.listen.live({
                    model: 'nova-2-medical',
                    language: 'en-US',
                    smart_format: true,
                    interim_results: true,
                    punctuate: true,
                    endpointing: 300,
                    encoding: 'linear16',
                    sample_rate: 16000,
                    channels: 1
                });

                deepgramLive.on(LiveTranscriptionEvents.Open, () => {
                    console.log('✅ DeepGram connection opened - ready for audio');
                    socket.emit('status', 'ready');
                });

                deepgramLive.on(LiveTranscriptionEvents.Transcript, (data) => {
                    const transcript = data.channel?.alternatives[0]?.transcript;
                    if (transcript) {
                        console.log('📝 DeepGram transcript:', transcript);
                        // Send back to this specific socket (and potentially room)
                        socket.emit('transcription-data', {
                            text: transcript,
                            isFinal: data.is_final,
                            speaker: 'User' // DeepGram doesn't always diarize single stream well, assumes sender
                        });
                    }
                });

                deepgramLive.on(LiveTranscriptionEvents.Error, (error) => {
                    console.error('❌ DeepGram error:', error);
                    socket.emit('error', { message: error.message || 'DeepGram error' });
                });

                deepgramLive.on(LiveTranscriptionEvents.Close, () => {
                    console.log('DeepGram connection closed');
                });

                // Log that connection is being attempted
                console.log('🔄 DeepGram connection initiated, waiting for Open event...');

            } catch (error) {
                console.error('Failed to create DeepGram connection:', error);
                socket.emit('error', { message: 'Failed to connect to DeepGram' });
            }
        });

        let audioChunkCount = 0;
        // Receive audio data from client
        socket.on('audio-data', (data) => {
            audioChunkCount++;
            if (audioChunkCount % 10 === 1) {
                console.log(`🎵 Audio chunk #${audioChunkCount} received, size: ${data?.byteLength || data?.length} bytes`);
            }
            if (deepgramLive && deepgramLive.getReadyState() === 1) {
                deepgramLive.send(data);
            } else {
                console.log('⚠️ DeepGram not ready (state:', deepgramLive?.getReadyState(), '), dropping audio chunk');
            }
        });

        socket.on('stop-stream', () => {
            if (deepgramLive) {
                deepgramLive.finish();
                deepgramLive = null;
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected from transcription');
            if (deepgramLive) {
                deepgramLive.finish();
                deepgramLive = null;
            }
        });
    });

    console.log('🎙️ Transcription Socket.io namespace ready on /transcription');
}

export default router;
