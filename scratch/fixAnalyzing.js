const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/analyzing.tsx');
let content = fs.readFileSync(file, 'utf8');

// Ensure useUser is imported
if (!content.includes('useUser')) {
  content = content.replace("import { useAuth } from '@clerk/clerk-expo';", "import { useAuth, useUser } from '@clerk/clerk-expo';");
}

// Add useUser hook if missing
if (!content.includes('const { user } = useUser();')) {
  content = content.replace("const { getToken, userId } = useAuth();", "const { getToken, userId } = useAuth();\n  const { user } = useUser();");
}

// Add userName to payload
const payloadBlock = `          body: JSON.stringify({
            sourceUrl: url,
            userId,
            mode: mode || 'ad',
          })`;

const fixedPayloadBlock = `          body: JSON.stringify({
            sourceUrl: url,
            userId,
            userName: user?.firstName || 'Creator',
            mode: mode || 'ad',
          })`;

if (content.includes(payloadBlock)) {
  content = content.replace(payloadBlock, fixedPayloadBlock);
}

fs.writeFileSync(file, content);
console.log("Updated analyzing.tsx successfully");
