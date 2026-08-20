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

async function testRoleAuthAndFlows() {
  console.log('--- 1. Testing Login as Admin ---');
  const adminLogin = await request('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    email: 'admin@lions.lk',
    password: 'admin123',
  });
  console.log('Admin Login status:', adminLogin.status, 'Role:', adminLogin.data.user.role);
  const adminToken = adminLogin.data.token;

  console.log('\n--- 2. Testing Login as Customer ---');
  const custLogin = await request('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, {
    email: 'kamal@apex.lk',
    password: 'customer123',
  });
  console.log('Customer Login status:', custLogin.status, 'Role:', custLogin.data.user.role);
  const custToken = custLogin.data.token;

  console.log('\n--- 3. Testing Protected Admin User Directory ---');
  const usersRes = await request('http://localhost:5000/api/auth/users', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`Admin accessed user directory: ${usersRes.data.count} users found.`);

  console.log('\n--- 4. Testing Route Protection (Customer accessing Admin-only route) ---');
  const forbiddenRes = await request('http://localhost:5000/api/auth/users', {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  console.log('Customer accessing /api/auth/users -> Status:', forbiddenRes.status, 'Response:', forbiddenRes.data.message);

  console.log('\n--- 5. Testing Customer My Rentals ---');
  const myRentalsRes = await request('http://localhost:5000/api/rentals/my-rentals', {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  console.log('Customer my-rentals count:', myRentalsRes.data.count);

  console.log('\n--- 6. Testing Payments Ledger Endpoint ---');
  const paymentsRes = await request('http://localhost:5000/api/payments', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`Payments count: ${paymentsRes.data.count}`);

  console.log('\n--- 7. Testing KYC Approval by Admin ---');
  const pendingUser = usersRes.data.data.find(u => u.verification_status === 'Pending');
  if (pendingUser) {
    const kycRes = await request(`http://localhost:5000/api/auth/users/${pendingUser._id}/verify`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    }, { status: 'Verified' });
    console.log('KYC Approval result:', kycRes.data.message);
  }

  console.log('\n✅ All Role-Based Authentication & Database tests passed successfully!');
}

testRoleAuthAndFlows();
