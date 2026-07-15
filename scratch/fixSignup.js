const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/signup.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace the router.replace('/lens') inside the verify function.
// We can use a regex or string replacement.
content = content.replace(
  "await setActive({ session: completeSignUp.createdSessionId });\n        router.replace('/lens');",
  "await setActive({ session: completeSignUp.createdSessionId });\n        router.replace('/questionnaire');"
);

// Add AmbientGlow if not present
if (!content.includes('import { AmbientGlow }')) {
  content = content.replace(
    "import { useSignUp } from '@clerk/clerk-expo';",
    "import { useSignUp } from '@clerk/clerk-expo';\nimport { AmbientGlow } from '../components/AmbientGlow';"
  );
}

if (!content.includes('<AmbientGlow />')) {
  content = content.replace(
    "return (\n      <SafeAreaView style={[styles.container",
    "return (\n      <SafeAreaView style={[styles.container"
  ); // Wait, we have multiple return statements for SafeAreaView.
  
  // Actually let's just do a blanket regex:
  content = content.replace(/<SafeAreaView([^>]*)>/g, "<SafeAreaView$1>\n      <AmbientGlow />");
}

fs.writeFileSync(file, content);
console.log("Fixed signup.tsx");
