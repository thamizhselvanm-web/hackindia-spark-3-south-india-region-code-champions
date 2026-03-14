const http = require('http');

const options = [
  { host: '127.0.0.1', port: 5000, path: '/api/stats' },
  { host: 'localhost', port: 5000, path: '/api/stats' },
  { host: '::1', port: 5000, path: '/api/stats' }
];

options.forEach(opt => {
  const req = http.get(opt, (res) => {
    console.log(`SUCCESS [${opt.host}]: Status ${res.statusCode}`);
    res.on('data', () => {});
  });

  req.on('error', (e) => {
    console.error(`FAILURE [${opt.host}]: ${e.message}`);
  });
});
