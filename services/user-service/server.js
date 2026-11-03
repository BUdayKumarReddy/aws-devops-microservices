const http = require('http');
const port = Number(process.env.PORT || 3001);
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/health' || req.url === '/users/health') {
    res.writeHead(200); return res.end(JSON.stringify({ service: 'user-service', status: 'healthy' }));
  }
  if (req.url === '/users' || req.url === '/') {
    res.writeHead(200); return res.end(JSON.stringify([{ id: 1, name: 'Demo User' }]));
  }
  res.writeHead(404); res.end(JSON.stringify({ error: 'Not found', service: 'user-service' }));
});
server.listen(port, '0.0.0.0', () => console.log(`user-service listening on ${port}`));
