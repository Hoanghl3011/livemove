import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { randomDate } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';

export const options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramping up to 100 drivers
    { duration: '3m', target: 1000 }, // Scaling to 1000 drivers
    { duration: '1m', target: 0 },    // Ramping down
  ],
};

export default function () {
  const url = 'ws://localhost:3000/tracking'; // Adjust to your real tracking gateway URL
  const params = { tags: { my_tag: 'driver_gps_load' } };

  const res = ws.connect(url, params, function (socket) {
    socket.on('open', () => {
      console.log('Driver connected');
      
      // Simulate GPS updates every 5 seconds
      socket.setInterval(() => {
        const payload = JSON.stringify({
          driverId: `driver-${__VU}`,
          latitude: 10.8231 + (Math.random() - 0.5) * 0.01,
          longitude: 106.6297 + (Math.random() - 0.5) * 0.01,
        });
        
        socket.send(payload);
      }, 5000);
    });

    socket.on('message', (data) => {
      // console.log(`Message received: ${data}`);
    });

    socket.on('close', () => console.log('Driver disconnected'));
    socket.on('error', (e) => console.log('An error occurred: ', e.error()));

    // Keep the connection open for a while
    sleep(180); 
    socket.close();
  });

  check(res, { 'status is 101 (Switching Protocols)': (r) => r && r.status === 101 });
}
