const jwt = require('jsonwebtoken');
const fs = require('fs');

// Load the service account key
const privateKey = fs.readFileSync('scripts/house-whisper-e2966c155bd7.json');

// Decode the private key to get the email
const serviceAccount = JSON.parse(privateKey.toString());

const payload = {
  iss: serviceAccount.client_email,
  scope: 'https://www.googleapis.com/auth/calendar',
  aud: 'https://oauth2.googleapis.com/token',
  exp: Math.floor(Date.now() / 1000) + 3600, // Current time in seconds plus 3600 seconds (1 hour)
  iat: Math.floor(Date.now() / 1000),
};

// Sign the JWT
const token = jwt.sign(payload, serviceAccount.private_key, { algorithm: 'RS256' });
console.log(token);
