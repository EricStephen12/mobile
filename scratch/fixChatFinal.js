const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/chat.tsx');
let content = fs.readFileSync(file, 'utf8');

const lines = content.split('\n');

// Lines 0 to 25 (index 25 is the closing `);` of BackArrow)
const topPart = lines.slice(0, 26).join('\n');

const boltIconIndex = content.indexOf('const BoltIcon =');
const bottomPart = content.slice(boltIconIndex);

const newContent = topPart + '\n\n' + bottomPart;

fs.writeFileSync(file, newContent);
console.log("chat.tsx perfectly restored and DotsMenu definition removed.");
