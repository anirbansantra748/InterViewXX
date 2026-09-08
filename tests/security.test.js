const { runJavaScript } = require('../utils/codeRunner');

async function runSecurityTests() {
  console.log('🚀 Starting InterViewXX Sandbox Security Benchmarks...\n');
  
  let passed = 0;
  let total = 0;

  const runTest = async (name, code, expectedStatus, expectedContent) => {
    total++;
    process.stdout.write(`Testing: ${name}... `);
    const result = await runJavaScript(code, '', 2000);
    
    if (result.status === expectedStatus && (expectedContent ? result.stderr.includes(expectedContent) || result.stdout.includes(expectedContent) : true)) {
      console.log('✅ Passed');
      passed++;
    } else {
      console.log(`❌ Failed. Got Status: ${result.status}, Output: ${result.stdout || result.stderr}`);
    }
    return result;
  };

  // 1. Basic Functionality
  await runTest(
    'Basic Execution (Fibonacci)', 
    `
    function fib(n) { return n <= 1 ? n : fib(n-1) + fib(n-2); }
    console.log(fib(10));
    `, 
    'Success', 
    '55'
  );

  // 2. Block require('fs')
  await runTest(
    'File System Access Block (require("fs"))',
    `const fs = require('fs'); fs.readFileSync('/etc/passwd');`,
    'Security Violation',
    'is not allowed'
  );

  // 3. Block process.env
  await runTest(
    'Environment Variables Block (process.env)',
    `console.log(process.env.MONGO_URI || "EMPTY");`,
    'Success', // It won't crash, it just won't have the vars
    'EMPTY'
  );

  // 4. Block infinite loops
  await runTest(
    'Infinite Loop Prevention (Timeout)',
    `while(true) {}`,
    'Time Limit Exceeded'
  );

  // 5. Memory Limit test (64MB)
  await runTest(
    'Memory Limit Enforcement (64MB)',
    `const arr = []; while(true) { arr.push(new Array(1000000).fill(1)); }`,
    'Runtime Error' // Will fail due to memory exhaustion
  );

  console.log(`\n📊 RESULTS: ${passed}/${total} Security Tests Passed\n`);
  process.exit(passed === total ? 0 : 1);
}

runSecurityTests();
