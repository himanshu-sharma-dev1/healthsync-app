const squareToken = 'EAAAl87uMRO2RLeG9_Ni34rS3AbeKfvj4aCItmkGAGoIP-tG9HySxT3zivJjDQG5';
const deepgramKey = '1094335913776280a64a3b4ab644fe86f6259d10';

async function verifyIntegrations() {
    console.log('🔍 Verifying Integrations...\n');

    // 1. Verify Square (Sandbox)
    console.log('💳 Testing Square API (Sandbox)...');
    try {
        const sqResponse = await fetch('https://connect.squareupsandbox.com/v2/locations', {
            headers: {
                'Authorization': `Bearer ${squareToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (sqResponse.ok) {
            const data = await sqResponse.json();
            console.log('✅ Square Success! Locations found:', data.locations?.length || 0);
        } else {
            console.log('❌ Square Failed:', await sqResponse.text());
        }
    } catch (err) {
        console.error('❌ Square Error:', err.message);
    }

    console.log('\n-------------------\n');

    // 2. Verify DeepGram
    console.log('🎙️ Testing DeepGram API...');
    try {
        const dgResponse = await fetch('https://api.deepgram.com/v1/projects', {
            headers: {
                'Authorization': `Token ${deepgramKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (dgResponse.ok) {
            const data = await dgResponse.json();
            console.log('✅ DeepGram Success! Projects found:', data.projects?.length || 0);
        } else {
            console.log('❌ DeepGram Failed:', await dgResponse.text());
        }
    } catch (err) {
        console.error('❌ DeepGram Error:', err.message);
    }
}

verifyIntegrations();
