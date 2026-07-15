const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/questionnaire.tsx');
let content = fs.readFileSync(file, 'utf8');

// Add TypewriterText component definition right before the QuestionnaireScreen function
const typewriterCode = `
const TypewriterText = ({ text, style, delay = 0 }: { text: string, style: any, delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    let interval: NodeJS.Timeout;

    const startTyping = () => {
      interval = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
        }
      }, 30); // Speed of typing
    };

    const timeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, delay]);

  return <Text style={style}>{displayedText}</Text>;
};

export default function QuestionnaireScreen() {
`;

if (!content.includes('TypewriterText')) {
  content = content.replace('export default function QuestionnaireScreen() {', typewriterCode);

  // Replace stepTitles and stepSubtitles in renderStep1 to renderStep4
  const steps = [
    { oldTitle: "What describes{'\\n'}you best?", newTitle: "What describes\\nyou best?" },
    { oldSubtitle: "This helps us tailor your intelligence feed." },
    { oldTitle: "What is your{'\\n'}primary goal?", newTitle: "What is your\\nprimary goal?" },
    { oldSubtitle: "We'll focus your insights on what matters." },
    { oldTitle: "What is your{'\\n'}full name?", newTitle: "What is your\\nfull name?" },
    { oldSubtitle: "So we know what to call you." },
    { oldTitle: "Choose your{'\\n'}Intelligence Lens", newTitle: "Choose your\\nIntelligence Lens" },
    { oldSubtitle: "Select your primary workspace." }
  ];

  content = content.replace(/<Text style={\[styles\.stepTitle, \{ color: colors\.text \}\]}>What describes\{'\\n'\}you best\?<\/Text>/, 
    "<TypewriterText text=\"What describes\\nyou best?\" style={[styles.stepTitle, { color: colors.text }]} />");
  
  content = content.replace(/<Text style={\[styles\.stepSubtitle, \{ color: colors\.textSubtle \}\]}>This helps us tailor your intelligence feed\.<\/Text>/, 
    "<TypewriterText text=\"This helps us tailor your intelligence feed.\" style={[styles.stepSubtitle, { color: colors.textSubtle }]} delay={500} />");

  content = content.replace(/<Text style={\[styles\.stepTitle, \{ color: colors\.text \}\]}>What is your\{'\\n'\}primary goal\?<\/Text>/, 
    "<TypewriterText text=\"What is your\\nprimary goal?\" style={[styles.stepTitle, { color: colors.text }]} />");
  
  content = content.replace(/<Text style={\[styles\.stepSubtitle, \{ color: colors\.textSubtle \}\]}>We'll focus your insights on what matters\.<\/Text>/, 
    "<TypewriterText text=\"We'll focus your insights on what matters.\" style={[styles.stepSubtitle, { color: colors.textSubtle }]} delay={500} />");

  content = content.replace(/<Text style={\[styles\.stepTitle, \{ color: colors\.text \}\]}>What is your\{'\\n'\}full name\?<\/Text>/, 
    "<TypewriterText text=\"What is your\\nfull name?\" style={[styles.stepTitle, { color: colors.text }]} />");
  
  content = content.replace(/<Text style={\[styles\.stepSubtitle, \{ color: colors\.textSubtle \}\]}>So we know what to call you\.<\/Text>/, 
    "<TypewriterText text=\"So we know what to call you.\" style={[styles.stepSubtitle, { color: colors.textSubtle }]} delay={500} />");

  content = content.replace(/<Text style={\[styles\.stepTitle, \{ color: colors\.text \}\]}>Choose your\{'\\n'\}Intelligence Lens<\/Text>/, 
    "<TypewriterText text=\"Choose your\\nIntelligence Lens\" style={[styles.stepTitle, { color: colors.text }]} />");
  
  content = content.replace(/<Text style={\[styles\.stepSubtitle, \{ color: colors\.textSubtle \}\]}>Select your primary workspace\.<\/Text>/, 
    "<TypewriterText text=\"Select your primary workspace.\" style={[styles.stepSubtitle, { color: colors.textSubtle }]} delay={500} />");

  fs.writeFileSync(file, content);
  console.log("Added TypewriterText");
} else {
  console.log("TypewriterText already exists");
}
