async function testRefresh() {
  try {
    console.log('1. Logging in...');
    const loginRes = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@livemove.com',
        password: 'Admin@123456'
      })
    });
    const loginData = await loginRes.json();
    const { access_token, refresh_token } = loginData;
    console.log('Login Success. Refresh Token received.');

    console.log('2. Testing /auth/refresh...');
    const refreshRes = await fetch('http://localhost:3000/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh_token: refresh_token
      })
    });
    const refreshData = await refreshRes.json();
    
    if (refreshRes.status === 201 && refreshData.access_token) {
        console.log('Refresh Success! New access token received.');
    } else {
        console.log('Refresh Failed:', refreshData);
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testRefresh();
