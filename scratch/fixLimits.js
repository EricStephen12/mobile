const fs = require('fs');
const path = require('path');

const homeFile = path.join(__dirname, '../src/app/home.tsx');
let homeContent = fs.readFileSync(homeFile, 'utf8');

const regex = /\{!isPro && \(\s*<View style=\{styles\.scanCountRow\}>\s*<Text style=\{\[styles\.scanCountText, \{ color: colors\.textSubtle \}\]\}>\s*\{scansRemaining\} of \{FREE_SCAN_LIMIT\} free scans remaining\s*<\/Text>\s*<\/View>\s*\)\}/;

const replacement = `            <View style={styles.scanCountRow}>
              <Text style={[styles.scanCountText, { color: colors.textSubtle }]}>
                {!isPro 
                  ? \`\${scansRemaining} of \${FREE_SCAN_LIMIT} free scans remaining • Max 90s video\` 
                  : \`Unlimited Scans • Extended video length enabled\`}
              </Text>
            </View>`;

if (regex.test(homeContent)) {
  homeContent = homeContent.replace(regex, replacement);
  fs.writeFileSync(homeFile, homeContent);
  console.log("Updated home.tsx with limit info.");
} else {
  console.log("Could not find the target string in home.tsx.");
}
