const fetch = require('node-fetch'); // If needed, Node 18 natively has fetch

const BASE_URL = 'https://pneumococcal-ternately-deedra.ngrok-free.dev/api';

async function test() {
    try {
        // 1. Register a test user
        const regRes = await fetch(`${BASE_URL}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `test${Date.now()}@example.com`,
                phone_number: `0700${Math.floor(100000 + Math.random() * 900000)}`,
                full_name: "Test User",
                password: "password123",
                gender: "male"
            })
        });

        const regData = await regRes.json();
        console.log("Registered:", regData);

        // 2. Login
        const loginRes = await fetch(`${BASE_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: regData.email,
                password: "password123"
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.access;
        console.log("Logged in, token length:", token ? token.length : "NO TOKEN");

        // 3. Fetch all users
        const roomRes = await fetch(`${BASE_URL}/users/`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log("getUser Status:", roomRes.status);
        const text = await roomRes.text();

        // Find the traceback in the HTML
        const match = text.match(/<pre class="exception_value">([\s\S]*?)<\/pre>/);
        if (match) {
            console.log("Django Exception:", match[1]);
        } else {
            console.log(text.substring(0, 1000));
        }

    } catch (e) {
        console.error("Script error:", e);
    }
}
test();
