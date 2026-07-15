const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/chat.tsx');
let content = fs.readFileSync(file, 'utf8');

// The exact string in the file is:
//                 <BoltIcon color={colors.primary} />\n        <ScrollView

// Let's use a regex to be safe with line endings
const regex = /<BoltIcon color=\{colors\.primary\} \/>\s*<ScrollView/g;

const replacement = `<BoltIcon color={colors.primary} />
                <Text style={[styles.pillText, { color: colors.text }]}>{sessionMode === 'content' ? 'Content Intelligence' : 'Ad Intelligence'}</Text>
              </View>
            </View>
          </View>
        </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log("Fixed missing closing tags successfully.");
} else {
  console.log("Could not find the target string.");
}
