const compileJava = require('./java_hub/compileJava');

const code = `int add(int a, int b) { int sum = a + b; return sum; } int x = add(5, 10); if (x > 5) { print(x); }`;

try {
  const result = compileJava(code);
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (err) {
  console.error('Thrown error:', err);
}
