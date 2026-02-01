// Test script to verify the send-signup-Otp API endpoint
// Run with: node test-otp-api.js

const testEmail = 'test@gmail.com';
const apiUrl = `http://localhost:8081/api/v1/email/send-signup-Otp?signupEmail=${encodeURIComponent(testEmail)}`;

console.log('Testing OTP Send API...');
console.log('URL:', apiUrl);
console.log('Email:', testEmail);
console.log('---');

fetch(apiUrl, {
    method: 'POST',
    headers: {
        'Accept': '*/*',
    }
})
    .then(response => {
        console.log('Status:', response.status, response.statusText);
        return response.text();
    })
    .then(data => {
        console.log('Response:', data);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
