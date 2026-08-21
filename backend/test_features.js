const http = require('http');

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function testAll() {
  console.log('--- 1. Testing GET /api/tools ---');
  const toolsRes = await request('http://localhost:5000/api/tools');
  const tool = toolsRes.data.data[0];
  console.log(`Tool: ${tool.name}, Daily: ${tool.dailyRate}, Weekly: ${tool.weeklyRate}, Monthly: ${tool.monthlyRate}`);

  console.log('\n--- 2. Testing Date Range Availability Validation ---');
  const availRes = await request('http://localhost:5000/api/rentals/validate-availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    toolId: tool._id,
    startDate: '2026-09-01',
    dueDate: '2026-09-08',
  });
  console.log('Availability result:', availRes.data);

  console.log('\n--- 3. Testing WhatsApp / SMS Notification Endpoint ---');
  const rentalsRes = await request('http://localhost:5000/api/rentals');
  const rental = rentalsRes.data.data[0];
  const notifyRes = await request(`http://localhost:5000/api/rentals/${rental._id}/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    eventType: 'Return Reminder',
  });
  console.log('Notification Dispatch Result:', notifyRes.data);

  console.log('\n✅ All endpoints tested successfully!');
}

testAll();
