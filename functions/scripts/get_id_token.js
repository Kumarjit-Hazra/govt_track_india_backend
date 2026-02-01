const https = require('https');
const readline = require('readline');

// Config from .env.local
const API_KEY = "AIzaSyDRyYcOJWBDR_0ALkWvKST2Z3Wzj5VP1oY";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("=== Firebase ID Token Generator ===");
console.log("Enter credentials for a user to generate an ID token.");

rl.question('Email: ', (email) => {
    rl.question('Password: ', (password) => {

        const data = JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true
        });

        const options = {
            hostname: 'identitytoolkit.googleapis.com',
            path: `/v1/accounts:signInWithPassword?key=${API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                const response = JSON.parse(body);
                if (response.idToken) {
                    console.log("\n✅ SUCCESS! Here is your ID Token:\n");
                    console.log(response.idToken);
                    console.log("\nCopy this token and paste it into the 'token' variable in your Postman Collection.");
                } else {
                    console.error("\n❌ FAILED to get token:");
                    console.error(response.error ? response.error.message : response);
                }
                rl.close();
            });
        });

        req.on('error', (error) => {
            console.error(error);
            rl.close();
        });

        req.write(data);
        req.end();
    });
});
