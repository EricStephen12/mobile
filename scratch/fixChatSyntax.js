const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/chat.tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /setSessionThumb\(data\.thumbnail\);\s*sender: m\.role === 'user' \? 'user' : 'ai',\s*text: m\.text \|\| m\.content\s*\}\)\);/m;

const replacement = `setSessionThumb(data.thumbnail);
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

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log("Syntax error in fetchSession fixed successfully.");
} else {
  console.log("Could not find syntax error block.");
}
