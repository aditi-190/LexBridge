require('./server');

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/java/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'int x = y;' })
    });
    console.log('HTTP', res.status);
    console.log(await res.text());
  } catch (err) {
    console.error('Fetch error:', err);
  } finally {
    process.exit(0);
  }
}, 500);
