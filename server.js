// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);

    // Initialize CRON jobs after server starts (only in production)
    if (!dev) {
      setTimeout(() => {
        const cronUrl = `http://localhost:${port}/api/init`;

        fetch(cronUrl)
          .then(res => res.json())
          .then(data => console.log('[SERVER] CRON initialization:', data))
          .catch(err => console.error('[SERVER] Failed to initialize CRON:', err));
      }, 2000); // Reduced delay from 5s to 2s
    } else {
      console.log('[SERVER] Skipping CRON initialization in development mode');
    }
  });
});