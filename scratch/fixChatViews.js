const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/chat.tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /<\/View>\s*<\/View>\s*<KeyboardAvoidingView/m;

const replacement = `          </View>
        </View>
      </View>

      <KeyboardAvoidingView`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log("Added the missing 5th closing View tag successfully.");
} else {
  console.log("Could not find the target string.");
}
