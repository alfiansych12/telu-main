
const TELEGRAM_API_URL = 'https://api-v2.telkomuniversity.ac.id/asst-sd/2b1124b06656a9f1be88c3c978561a643f358d1275ef5ae3d2b44cce5a1fc5b4';

async function testTelegram() {
    const recipientId = '7192767939'; // The numerical Chat ID found in DB
    const payload = {
        channel: 'telegram',
        recipientId: recipientId,
        title: 'Test Notification',
        message: 'Ini adalah pesan test menggunakan Chat ID.',
        metadata: {
            parseMode: 'Markdown',
            disableNotification: false
        }
    };

    try {
        console.log('Sending request for Chat ID:', recipientId);
        const response = await fetch(TELEGRAM_API_URL, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

testTelegram();
