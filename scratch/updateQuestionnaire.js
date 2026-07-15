const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/questionnaire.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add lens state
if (!content.includes('const [lens, setLens]')) {
  content = content.replace(
    "const [fullName, setFullName] = useState('');",
    "const [fullName, setFullName] = useState('');\n  const [lens, setLens] = useState<'ad' | 'content'>('ad');"
  );
}

// 2. Update transitionToStep(4) to transitionToStep(5) inside handleFinish
content = content.replace("transitionToStep(4); // the loading step", "transitionToStep(5); // the loading step");

// 3. Update unsafeMetadata
content = content.replace(
  "goal,\n            onboardingComplete: true",
  "goal,\n            lens,\n            onboardingComplete: true"
);

// 4. Update router.replace('/lens') to router.replace('/home')
content = content.replace("router.replace('/lens');", "router.replace({ pathname: '/home', params: { lens } });");

// 5. Update next text in Step 3 to just say Next
content = content.replace("<Text style={styles.nextText}>Complete Setup</Text>", "<Text style={styles.nextText}>Next</Text>");

// 6. Update step < 4 to step < 5
content = content.replace("{step < 4 && (", "{step < 5 && (");

// 7. Update step / 3 to step / 4
content = content.replace("{step} / 3", "{step} / 4");

// 8. Add step 4 logic
const renderStep4Code = `  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Choose your{'\\n'}Intelligence Lens</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSubtle }]}>Select your primary workspace.</Text>
      
      <View style={styles.optionsList}>
        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: lens === 'ad' ? BRAND_GREEN : colors.surfaceBorder }, lens === 'ad' && styles.optionCardSelected]}
          activeOpacity={0.7}
          onPress={() => {
            Haptics.selectionAsync();
            setLens('ad');
            setTimeout(() => handleFinish(), 400); // Auto-advance to finish
          }}
        >
          <Text style={styles.optionIcon}>📊</Text>
          <Text style={[styles.optionLabel, { color: lens === 'ad' ? BRAND_GREEN : colors.text }]}>Ad Intelligence</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: lens === 'content' ? BRAND_GREEN : colors.surfaceBorder }, lens === 'content' && styles.optionCardSelected]}
          activeOpacity={0.7}
          onPress={() => {
            Haptics.selectionAsync();
            setLens('content');
            setTimeout(() => handleFinish(), 400); // Auto-advance to finish
          }}
        >
          <Text style={styles.optionIcon}>🎨</Text>
          <Text style={[styles.optionLabel, { color: lens === 'content' ? BRAND_GREEN : colors.text }]}>Content Intelligence</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep5 = () => (`;

content = content.replace("  const renderStep4 = () => (", renderStep4Code);

// 9. Update Step 3 next button to advance to Step 4 instead of finish
content = content.replace(
  "onPress={handleFinish}",
  "onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); transitionToStep(4); }}"
);
content = content.replace( // also the skip button
  "onPress={handleFinish}",
  "onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); transitionToStep(4); }}"
);

// 10. Render Step 4 and 5 in the Animated.View
content = content.replace(
  "{step === 4 && renderStep4()}",
  "{step === 4 && renderStep4()}\n            {step === 5 && renderStep5()}"
);

fs.writeFileSync(file, content);
console.log("Questionnaire updated.");
