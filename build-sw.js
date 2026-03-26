import { generateSW } from 'workbox-build';
import config from './workbox.config.cjs';

generateSW(config)
  .then(({ count, size }) => {
    console.log(`✅ Service worker generated`);
    console.log(`📦 ${count} files precached (${size} bytes)`);
  })
  .catch(err => {
    console.error('❌ SW generation failed:', err);
    process.exit(1);
  });
