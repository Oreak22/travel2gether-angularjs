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
  apiUrl: 'https://journey2gethere.byethost8.com/travel-agency-backend/api',
  paystackPublicKey: '${process.env.PAYSTACK_PUBLIC_KEY || ''}'
};

export default environment;
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`environment.ts generated successfully at ${targetPath}`);
