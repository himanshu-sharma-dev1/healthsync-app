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

// Export function to setup WebSocket for live transcription
export function setupTranscriptionWebSocket(server) {
    // Check if API key is configured
    if (!process.env.DEEPGRAM_API_KEY) {
        console.log('⚠️ DeepGram API key not configured - transcription WebSocket disabled');
        return null;
    }

    const wss = new WebSocketServer({
        server,
        path: '/transcribe'
    });

    wss.on('connection', async (ws, req) => {
        console.log('New transcription WebSocket connection');

        const client = getDeepgramClient();
        if (!client) {
            ws.send(JSON.stringify({ type: 'error', message: 'Transcription service not available' }));
            ws.close();
            return;
        }

        let deepgramLive = null;

        try {
            // Create live transcription connection
            deepgramLive = client.listen.live({
                model: 'nova-2-medical',
                language: 'en-US',
                smart_format: true,
                interim_results: true,
                punctuate: true,
                endpointing: 300
            });

            // Handle DeepGram events
            deepgramLive.on(LiveTranscriptionEvents.Open, () => {
                console.log('DeepGram connection opened');
                ws.send(JSON.stringify({ type: 'connected', status: 'ready' }));
            });

            deepgramLive.on(LiveTranscriptionEvents.Transcript, (data) => {
                const transcript = data.channel?.alternatives[0]?.transcript;
                if (transcript) {
                    ws.send(JSON.stringify({
                        type: 'transcript',
                        text: transcript,
                        isFinal: data.is_final,
                        confidence: data.channel?.alternatives[0]?.confidence
                    }));
                }
            });

            deepgramLive.on(LiveTranscriptionEvents.Error, (error) => {
                console.error('DeepGram error:', error);
                ws.send(JSON.stringify({ type: 'error', message: error.message }));
            });

            deepgramLive.on(LiveTranscriptionEvents.Close, () => {
                console.log('DeepGram connection closed');
            });

        } catch (error) {
            console.error('Failed to create DeepGram connection:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Failed to connect to transcription service' }));
            ws.close();
            return;
        }

        // Handle incoming audio data from client
        ws.on('message', (data) => {
            if (deepgramLive && deepgramLive.getReadyState() === 1) {
                deepgramLive.send(data);
            }
        });

        // Handle client disconnect
        ws.on('close', () => {
            console.log('Client disconnected from transcription');
            if (deepgramLive) {
                deepgramLive.finish();
            }
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            if (deepgramLive) {
                deepgramLive.finish();
            }
        });
    });

    console.log('🎙️ Transcription WebSocket server ready on /transcribe');
    return wss;
}

export default router;
