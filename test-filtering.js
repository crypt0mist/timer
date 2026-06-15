// Test script to verify banned word filtering

const isBannedMessage = (msg) => {
  const lowerMsg = String(msg).toLowerCase();
  // Ban specific problematic phrases and words
  const bannedPhrases = [
    'bhai', 'legend', 'kya ho', 'kia kr', 'aur kia', 'kaise ho', 'game khel', 
    'acha chal', 'shukriya', 'kehdo', 'kehna', 'kya kar', 'kya scene', 
    'arre beta', 'arre saab', 'ek minute', 'acha babu', 'waah bhai'
  ];
  return bannedPhrases.some(phrase => lowerMsg.includes(phrase));
};

// Test messages that SHOULD be blocked
const bannedMessages = [
  '"bhai legend"',
  '"kya ho gava"',
  '"kia kr rahe"',
  '"kya ho raha hai"',
  '"bhai kya kar rahe"',
  '"legend bhai"',
  '"kaise ho bhai"',
  '"game khel rahe ho"'
];

// Test messages that SHOULD pass (good messages)
const allowedMessages = [
  '"machli fry kar li"',
  '"donut khatam"',
  '"bitcoin phir gira"',
  '"ETH pump ho gaya"',
  '"machli pakad mil gaya"',
  '"donut craving start"',
  '"crypto hodl karte"',
  '"machli scale kat"',
  '"donut glazed lelo"',
  '"bitcoin tumble kar"'
];

console.log('🧪 Testing Banned Message Filter\n');

console.log('❌ Messages that SHOULD be BLOCKED:');
bannedMessages.forEach(msg => {
  const clean = msg.replace(/^"|"$/g, '');
  const result = isBannedMessage(clean);
  const status = result ? '✓ BLOCKED' : '✗ FAILED - Should be blocked';
  console.log(`  "${clean}" → ${status}`);
});

console.log('\n✅ Messages that SHOULD be ALLOWED:');
allowedMessages.forEach(msg => {
  const clean = msg.replace(/^"|"$/g, '');
  const result = isBannedMessage(clean);
  const status = !result ? '✓ ALLOWED' : '✗ FAILED - Should be allowed';
  console.log(`  "${clean}" → ${status}`);
});

// Count results
const bannedBlocked = bannedMessages.filter(m => isBannedMessage(m.replace(/^"|"$/g, ''))).length;
const allowedPassed = allowedMessages.filter(m => !isBannedMessage(m.replace(/^"|"$/g, ''))).length;

console.log(`\n📊 Results: ${bannedBlocked}/${bannedMessages.length} banned blocked, ${allowedPassed}/${allowedMessages.length} good messages allowed`);

if (bannedBlocked === bannedMessages.length && allowedPassed === allowedMessages.length) {
  console.log('\n✅ All tests PASSED! Filtering is working correctly.');
  process.exit(0);
} else {
  console.log('\n❌ Some tests FAILED!');
  process.exit(1);
}
