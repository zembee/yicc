// Wrapper script to run the TypeScript Rich Menu provisioner using ts-node
const fs = require('fs');
const path = require('path');

require('ts-node').register({ transpileOnly: true });
const { provisionRichMenus } = require('../src/lib/lineRichMenu');

function upsertEnvVar(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}=${value}`;
  if (regex.test(content)) {
    return content.replace(regex, line);
  }
  return `${content.trimEnd()}\n${line}\n`;
}

provisionRichMenus()
  .then(({ guestRichMenuId, loggedInRichMenuId }) => {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = upsertEnvVar(envContent, 'LINE_RICH_MENU_GUEST_ID', guestRichMenuId);
      envContent = upsertEnvVar(envContent, 'LINE_RICH_MENU_LOGGED_IN_ID', loggedInRichMenuId);
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('✅ Updated .env.local with Rich Menu IDs');
    }

    console.log('\n🎉 Provisioning complete:');
    console.log(`   LINE_RICH_MENU_GUEST_ID=${guestRichMenuId}`);
    console.log(`   LINE_RICH_MENU_LOGGED_IN_ID=${loggedInRichMenuId}`);
  })
  .catch((err) => {
    console.error('Provision failed:', err);
    process.exit(1);
  });
