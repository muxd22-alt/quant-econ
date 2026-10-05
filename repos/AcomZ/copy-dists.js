const fs = require('fs');
const path = require('path');

const srcChat = path.join(__dirname, 'chat_app/dist');
const destChat = path.join(__dirname, 'startup_main/dist/chat');

const srcRiyadh = path.join(__dirname, 'riyadh_app/dist');
const destRiyadh = path.join(__dirname, 'startup_main/dist/riyadh');

try {
  fs.cpSync(srcChat, destChat, { recursive: true });
  console.log('Copied chat_app/dist to startup_main/dist/chat');
} catch (e) {
  console.error('Error copying chat_app/dist:', e.message);
}

try {
  fs.cpSync(srcRiyadh, destRiyadh, { recursive: true });
  console.log('Copied riyadh_app/dist to startup_main/dist/riyadh');
} catch (e) {
  console.error('Error copying riyadh_app/dist:', e.message);
}
