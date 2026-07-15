const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/questionnaire.tsx');
let content = fs.readFileSync(file, 'utf8');

// Fix the typing speed
content = content.replace("}, 30); // Speed of typing", "}, 60); // Speed of typing");

// Fix the newline characters in JSX strings
content = content.replace(/text="What describes\\nyou best\?"/g, "text={\"What describes\\nyou best?\"}");
content = content.replace(/text="What is your\\nprimary goal\?"/g, "text={\"What is your\\nprimary goal?\"}");
content = content.replace(/text="What is your\\nfull name\?"/g, "text={\"What is your\\nfull name?\"}");
content = content.replace(/text="Choose your\\nIntelligence Lens"/g, "text={\"Choose your\\nIntelligence Lens\"}");

fs.writeFileSync(file, content);
console.log("Fixed Typewriter text issues");
