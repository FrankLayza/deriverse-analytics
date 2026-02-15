import { testMappings } from './instrument-mapping';

testMappings().then(() => {
  console.log('✅ Test complete');
  process.exit(0);
}).catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});