const fs = require('fs');

const file = 'src/app/analyzing.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add imports
content = content.replace(
  "import { useRouter } from 'expo-router';",
  "import { useRouter, useLocalSearchParams } from 'expo-router';\nimport { downloadVideo, extractFrames, cleanupVideo } from '../utils/videoProcessor';"
);

const newEffect = \`
  const { url } = useLocalSearchParams<{ url: string }>();
  const [errorMsg, setErrorMsg] = React.useState('');

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.55, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    let isMounted = true;
    let localVideoPath = '';

    async function processVideo() {
      try {
        if (!url) {
          throw new Error('No video URL provided');
        }

        // 1. Download video
        localVideoPath = await downloadVideo(url);

        // For duration, ideally we use a library to read it, but for now we'll 
        // assume a standard duration or we could pass duration from the previous screen.
        // Let's assume 15 seconds for this example unless we add a library.
        const durationMs = 15000; 

        // 2. Extract frames
        const frames = await extractFrames(localVideoPath, durationMs, 30);

        // 3. Send to backend
        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(\\\`\${API_URL}/api/analyze\\\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            frames,
            duration: durationMs / 1000,
            sourceUrl: url,
            userId: 'test-user-id' // Ideally get from Auth context
          })
        });

        const data = await response.json();

        if (!response.ok) {
           throw new Error(data.error || data.details || 'Analysis failed');
        }

        if (isMounted) {
          router.replace(\\\`/chat?sessionId=\${data.sessionId}\\\`);
        }

      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'An error occurred during analysis');
        }
      } finally {
        if (localVideoPath) {
          cleanupVideo(localVideoPath);
        }
      }
    }

    processVideo();

    return () => {
      isMounted = false;
    };
  }, [url]);
\`;

const startIdx = content.indexOf('  useEffect(() => {');
const endIdx = content.indexOf('  return (');

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + newEffect + "\n" + content.substring(endIdx);
  
  // also add error display in UI
  content = content.replace(
    "<View style={styles.stepsContainer}>",
    "{errorMsg ? <Text style={{color: 'red', textAlign: 'center', marginBottom: 20}}>{errorMsg}</Text> : null}\n        <View style={styles.stepsContainer}>"
  );
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully patched analyzing.tsx');
} else {
  console.log('Could not find start/end for patching analyzing.tsx');
}
