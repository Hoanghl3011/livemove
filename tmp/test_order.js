async function test() {
  try {
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@livemove.com',
        password: 'Admin@123456'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.access_token;
    console.log('Logged in. Token:', token.substring(0, 20) + '...');

    console.log('Creating order...');
    const createRes = await fetch('http://localhost:3000/orders', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        pickupAddress: "123 Test St",
        pickupLat: 10.7769,
        pickupLng: 106.6966,
        deliveryAddress: "456 Deliver Ave",
        deliveryLat: 10.7751,
        deliveryLng: 106.7015,
        receiverName: "Test User",
        receiverPhone: "0901234567"
      })
    });

    const body = await createRes.json();
    console.log('Status:', createRes.status);
    console.log('Response:', body);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
