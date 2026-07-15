const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/chat.tsx');
let content = fs.readFileSync(file, 'utf8');

// The file was corrupted around line 139. Let's fix the block manually.
// First, find where `setSessionThumb(data.thumbnail);` is and reconstruct what should follow.

const targetBlock = `            setSessionThumb(data.thumbnail);
              sender: m.role === 'user' ? 'user' : 'ai',
              text: m.text || m.content
            }));`;

const fixedBlock = `            setSessionThumb(data.thumbnail);
          }
          
          let msgs = data.messages || [];
          if (typeof msgs === 'string') {
            try { msgs = JSON.parse(msgs); } catch(e){}
          }
          if (msgs.length === 0) {
            const firstName = user?.firstName || 'there';
            msgs = [{ id: 'init', role: 'assistant', sender: 'ai', text: \`Hey \${firstName}! I've just watched this video. Ask me anything about its hook, pacing, or psychology!\` }];
          } else {
            // Map existing api format (role, content) to UI format (sender, text) if needed
            msgs = msgs.map((m: any, i: number) => ({
              ...m,
              id: m.id || i.toString(),
              sender: m.role === 'user' ? 'user' : 'ai',
              text: m.text || m.content
            }));`;

if (content.includes(targetBlock)) {
  content = content.replace(targetBlock, fixedBlock);
}

// Next, add the userName to the API payload
const apiPayload = `        body: JSON.stringify({
          messages: apiMessages,
          dna: dna || {},
          userId: user?.id
        })`;

const fixedPayload = `        body: JSON.stringify({
          messages: apiMessages,
          dna: dna || {},
          userId: user?.id,
          userName: user?.firstName || 'Creator'
        })`;

if (content.includes(apiPayload)) {
  content = content.replace(apiPayload, fixedPayload);
}

fs.writeFileSync(file, content);
console.log("Fixed chat.tsx successfully.");
