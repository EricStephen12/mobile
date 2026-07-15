const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/account.tsx');
let content = fs.readFileSync(file, 'utf8');

const buttonCode = `
              <TouchableOpacity 
                style={{ padding: 16, backgroundColor: colors.surface, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: colors.surfaceBorder }} 
                activeOpacity={0.7}
                onPress={() => router.push('/questionnaire')}
              >
                <Text style={{ color: BRAND_GREEN, fontFamily: sansFont, fontWeight: '600', textAlign: 'center' }}>Update Profile Questionnaire</Text>
              </TouchableOpacity>
`;

if (!content.includes('Update Profile Questionnaire')) {
  // Find "Manage Subscription" text, go down to the closing TouchableOpacity, and insert it after
  content = content.replace(
    /(<Text style={{.*?}}>Manage Subscription<\/Text>\s*<\/TouchableOpacity>)/,
    "$1" + buttonCode
  );
  fs.writeFileSync(file, content);
  console.log("Fixed account.tsx");
} else {
  console.log("Button already exists");
}
