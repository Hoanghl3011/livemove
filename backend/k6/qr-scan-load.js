import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramping up
    { duration: '3m', target: 200 }, // Peak load with 200 concurrent scans
    { duration: '1m', target: 0 },   // Ramping down
  ],
};

export default function () {
  const url = 'http://localhost:3000/orders/scan-qr';
  const payload = JSON.stringify({
    qrCode: `LIVE-ORD-${Math.floor(Math.random() * 100000)}`,
    customerId: `cust-${__VU}`,
    timestamp: new Date().toISOString(),
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer YOUR_TOKEN`, // Uncomment if JWT is implemented
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'status is 201': (r) => r.status === 201,
    'latency < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(Math.random() * 2 + 1); // Random wait between scans (1s - 3s)
}
