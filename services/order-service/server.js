const http = require('http');
const port = Number(process.env.PORT || 3003);
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/health' || req.url === '/orders/health') {
    res.writeHead(200); return res.end(JSON.stringify({ service: 'order-service', status: 'healthy' }));
  }
  if (req.url === '/orders' || req.url === '/') {
    res.writeHead(200); return res.end(JSON.stringify([{ id: 5001, userId: 1, productId: 101, status: 'created' }]));
  }
  res.writeHead(404); res.end(JSON.stringify({ error: 'Not found', service: 'order-service' }));
});
server.listen(port, '0.0.0.0', () => console.log(`order-service listening on ${port}`));
