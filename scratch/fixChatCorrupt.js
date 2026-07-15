const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/chat.tsx');
let content = fs.readFileSync(file, 'utf8');

const badBlock = `              <View style={[styles.modePill, { backgroundColor: colors.badgeBg, borderColor: colors.surfaceBorder }]}>
                <BoltIcon color={colors.primary} />
        <ScrollView`;

const goodBlock = `              <View style={[styles.modePill, { backgroundColor: colors.badgeBg, borderColor: colors.surfaceBorder }]}>
                <BoltIcon color={colors.primary} />
                <Text style={[styles.pillText, { color: colors.text }]}>{sessionMode === 'content' ? 'Content Intelligence' : 'Ad Intelligence'}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView`;

if (content.includes(badBlock)) {
  content = content.replace(badBlock, goodBlock);
}

// Remove the `numberOfLines={1}` from campaignTitle so it doesn't show `...`
content = content.replace(
  '<Text style={[styles.campaignTitle, { color: colors.text }]} numberOfLines={1}>{sessionTitle}</Text>',
  '<Text style={[styles.campaignTitle, { color: colors.text }]}>{sessionTitle}</Text>'
);

fs.writeFileSync(file, content);
console.log("Fixed chat.tsx corruption and removed numberOfLines ellipsis");
