const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/home.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Update Avatar initial
content = content.replace(
  "<Text style={[styles.avatarInitial, { color: colors.text }]}>E</Text>",
  "<Text style={[styles.avatarInitial, { color: colors.text }]}>{user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'E'}</Text>"
);

// 2. Add Greeting
const greetingCode = `
          {/* ───────── GREETING ───────── */}
          <Text style={[styles.greeting, { color: colors.text }]}>
            Welcome back, {user?.firstName || 'Creator'}.
          </Text>

          {/* ───────── MODE PILL ───────── */}
`;

if (!content.includes('Welcome back')) {
  content = content.replace("{/* ───────── MODE PILL ───────── */}", greetingCode);
}

// 3. Add greeting styles
const styleCode = `  greeting: {
    fontSize: 28,
    fontFamily: serifFont,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 24,
  },
  pillRow: {`;

if (!content.includes('greeting: {')) {
  content = content.replace("pillRow: {", styleCode);
}

fs.writeFileSync(file, content);
console.log("Added greeting to home.tsx");
