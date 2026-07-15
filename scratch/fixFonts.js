const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '../src/app');
const files = fs.readdirSync(appDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(appDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // A regex to match style blocks containing fontFamily: serifFont
  // It looks for a block like `name: { ... fontFamily: serifFont, ... fontWeight: '...', ... }`
  // We can just remove fontWeight lines that are in the same object as serifFont.
  
  // Since styles are generally formatted nicely, we can just look for instances of `fontFamily: serifFont,` 
  // and manually inspect if the next or previous lines have fontWeight.
  
  // A simpler Regex to just remove `fontWeight: '700',` or `fontWeight: 'bold',` or `fontWeight: "..."` 
  // ONLY if it is near serifFont.
  
  const lines = content.split('\n');
  let inSerifBlock = false;
  let newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we are inside a style object that uses serifFont
    if (line.includes('fontFamily: serifFont')) {
      // If the *previous* line was fontWeight, we should remove it (pop it from newLines)
      if (newLines.length > 0 && newLines[newLines.length - 1].includes('fontWeight:')) {
        newLines.pop();
      }
      newLines.push(line);
      // Look ahead for fontWeight on the next few lines within the same block
      inSerifBlock = true;
    } else if (inSerifBlock && line.includes('}')) {
      inSerifBlock = false;
      newLines.push(line);
    } else if (inSerifBlock && line.includes('fontWeight:')) {
      // Skip this line
    } else {
      newLines.push(line);
    }
  }
  
  const newContent = newLines.join('\n');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Fixed font weights in:', file);
  }
});
