const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function getJavaHome() {
  const searchDirs = [
    'C:\\Program Files\\Eclipse Adoptium',
    'C:\\Program Files\\Java',
    'C:\\Program Files\\Microsoft'
  ];

  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        const jdk17 = files.find(f => f.startsWith('jdk-17') && fs.statSync(path.join(dir, f)).isDirectory());
        if (jdk17) {
          const matchedPath = path.join(dir, jdk17);
          console.log(`› Found JDK 17 installation at: ${matchedPath}`);
          return matchedPath;
        }
      } catch (err) {
        // Ignore directory read errors
      }
    }
  }

  const defaultJbr = "C:\\Program Files\\Android\\Android Studio\\jbr";
  console.log(`› JDK 17 not found. Falling back to Android Studio JBR (JDK 21) at: ${defaultJbr}`);
  return defaultJbr;
}

const javaHome = getJavaHome();

// Configure environment variables for this process execution
process.env.JAVA_HOME = javaHome;
process.env.PATH = `${javaHome}\\bin;${process.env.PATH}`;

console.log(`› Setting JAVA_HOME to: ${javaHome}`);
console.log('› Executing npx expo run:android...');

// Spawn the run:android command
const child = spawn('npx', ['expo', 'run:android'], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  process.exit(code);
});
