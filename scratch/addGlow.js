const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '../src/app');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (filePath.endsWith('_layout.tsx')) return;

  let modified = false;

  // Remove old LinearGradient imports
  if (content.includes("import { LinearGradient } from 'expo-linear-gradient';")) {
    content = content.replace("import { LinearGradient } from 'expo-linear-gradient';\n", "");
  }

  // Add AmbientGlow import if not present
  if (!content.includes("import { AmbientGlow }")) {
    // Find the last import statement
    const importMatches = [...content.matchAll(/^import .* from .*;$/gm)];
    if (importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const importString = "\nimport { AmbientGlow } from '../components/AmbientGlow';";
      const insertPos = lastImport.index + lastImport[0].length;
      content = content.slice(0, insertPos) + importString + content.slice(insertPos);
      modified = true;
    }
  }

  // Remove old explicit LinearGradients we added
  const oldGradientRegex = /<LinearGradient\s+colors=\{\['rgba\(202,\s*255,\s*0,\s*0\.15\)',\s*'transparent'\]\}\s+style=\{\{\s*position:\s*'absolute',\s*top:\s*0,\s*left:\s*0,\s*right:\s*0,\s*height:\s*300\s*\}\}\s+pointerEvents="none"\s*\/>\s*/g;
  if (oldGradientRegex.test(content)) {
    content = content.replace(oldGradientRegex, "");
  }

  // Insert <AmbientGlow /> inside the first SafeAreaView or main View return
  if (!content.includes('<AmbientGlow />')) {
    // We look for the first `<SafeAreaView...>` or `<View...>` right after `return (`
    const returnRegex = /return\s*\(\s*(<SafeAreaView[^>]*>|<View[^>]*>)/;
    const match = returnRegex.exec(content);
    if (match) {
      const insertPos = match.index + match[0].length;
      content = content.slice(0, insertPos) + "\n      <AmbientGlow />" + content.slice(insertPos);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modified:', path.basename(filePath));
  }
}

const files = fs.readdirSync(appDir).filter(f => f.endsWith('.tsx'));
files.forEach(f => {
  processFile(path.join(appDir, f));
});
