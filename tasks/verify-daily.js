const apiKey = '465764af3f492271eb9686f0dba6b3e2914e8eacb938a3596c9a193f22b603cb';

async function verifyDaily() {
    console.log('Testing Daily.co API key...');
    try {
        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                properties: {
                    exp: Math.round(Date.now() / 1000) + 300 // 5 mins
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Success! Room created:');
            console.log('Name:', data.name);
            console.log('URL:', data.url);
        } else {
            console.log('❌ Failed:', data);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verifyDaily();
