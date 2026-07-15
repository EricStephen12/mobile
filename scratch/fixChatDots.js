const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/chat.tsx');
let content = fs.readFileSync(file, 'utf8');

// I need to repair the deleted block which was roughly:
//                 <Text style={[styles.pillText, { color: colors.text }]}>{sessionMode === 'content' ? 'Content Intelligence' : 'Ad Intelligence'}</Text>
//               </View>
//             </View>
//           </View>
//         </View>
//       </View>
// 
//       <KeyboardAvoidingView
//         style={styles.keyboardView}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       >

const searchBlock = `              <View style={[styles.modePill, { backgroundColor: colors.badgeBg, borderColor: colors.surfaceBorder }]}>
                <BoltIcon color={colors.primary} />
        <ScrollView`;

const replaceBlock = `              <View style={[styles.modePill, { backgroundColor: colors.badgeBg, borderColor: colors.surfaceBorder }]}>
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

if (content.includes(searchBlock)) {
  content = content.replace(searchBlock, replaceBlock);
}

// Remove the DotsMenu component definition to keep it clean
const dotsMenuStart = `const DotsMenu = ({ color }: { color: string }) => (`;
const dotsMenuEnd = `  </Svg>
);`;

if (content.includes(dotsMenuStart)) {
  const startIdx = content.indexOf(dotsMenuStart);
  const endIdx = content.indexOf(dotsMenuEnd, startIdx) + dotsMenuEnd.length;
  content = content.slice(0, startIdx) + content.slice(endIdx + 1); // remove the component block
}

fs.writeFileSync(file, content);
console.log("Fixed chat.tsx dots menu removal successfully.");
