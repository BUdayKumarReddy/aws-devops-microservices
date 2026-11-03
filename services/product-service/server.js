const http = require('http');
const port = Number(process.env.PORT || 3002);
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/health' || req.url === '/products/health') {
    res.writeHead(200); return res.end(JSON.stringify({ service: 'product-service', status: 'healthy' }));
  }
  if (req.url === '/products' || req.url === '/') {
    res.writeHead(200); return res.end(JSON.stringify([{ id: 101, name: 'Demo Product', price: 99 }]));
  }
  res.writeHead(404); res.end(JSON.stringify({ error: 'Not found', service: 'product-service' }));
});
server.listen(port, '0.0.0.0', () => console.log(`product-service listening on ${port}`));
