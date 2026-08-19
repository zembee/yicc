// Wrapper script to run the TypeScript Rich Menu provisioner using ts-node
require('ts-node').register({ transpileOnly: true });
const { provisionRichMenu } = require('../src/lib/lineRichMenu');
provisionRichMenu().catch(err => {
  console.error('Provision failed:', err);
  process.exit(1);
});
