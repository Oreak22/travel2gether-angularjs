// scripts/set-env.js
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/environments');
const targetPath = path.join(dir, 'environment.ts');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: 'https://travel-agency-backend-2026.up.railway.app/api',
  paystackPublicKey: '${process.env.PAYSTACK_PUBLIC_KEY || ''}',
  apple_client_id: 'com.yourcompany.app.service',
  google_client_id: '99400717057-t9208kg83e46iqtj20oqpsicface4o70.apps.googleusercontent.com',
};

export default environment;
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`environment.ts generated successfully at ${targetPath}`);
