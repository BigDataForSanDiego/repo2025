const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Ignore self-signed certificates in development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../certs/localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/localhost-cert.pem')),
};

const apiProxy = createProxyMiddleware({
  target: 'http://localhost:8000/',
  changeOrigin: true,
  secure: false,
  logLevel: 'debug',
});

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // Handle API proxy
    if (req.url.startsWith('/api/')) {
      return apiProxy(req, res);
    }
    
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
    console.log('> Backend API: http://localhost:8000');
  });
});