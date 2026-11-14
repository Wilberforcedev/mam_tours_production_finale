import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = resolve(fileURLToPath(new URL('./dist/', import.meta.url)));
const rootPrefix = `${webRoot}${sep}`;
const port = Number(process.env.PORT ?? 8000);
const host = process.env.HOST ?? '0.0.0.0';

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new RangeError(`Invalid port value: ${process.env.PORT}`);
}

const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' https://images.unsplash.com data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self' mailto:"
  ].join('; '),
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg']
]);

function sendText(response, status, message) {
  response.writeHead(status, {
    ...securityHeaders,
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8'
  });
  response.end(message);
}

async function serveFile(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    sendText(response, 405, 'Method not allowed\n');
    return;
  }

  let parsedUrl;
  let requestPath;
  try {
    parsedUrl = new URL(request.url ?? '/', 'http://localhost');
    requestPath = decodeURIComponent(parsedUrl.pathname);
  } catch {
    sendText(response, 400, 'Bad request\n');
    return;
  }

  if (parsedUrl.pathname === '/healthz') {
    response.writeHead(200, {
      ...securityHeaders,
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8'
    });
    response.end(request.method === 'HEAD' ? undefined : 'ok\n');
    return;
  }

  let filePath = resolve(webRoot, `.${requestPath}`);
  if (filePath !== webRoot && !filePath.startsWith(rootPrefix)) {
    sendText(response, 403, 'Forbidden\n');
    return;
  }

  try {
    let fileInfo = await stat(filePath);
    if (fileInfo.isDirectory()) {
      filePath = resolve(filePath, 'index.html');
      fileInfo = await stat(filePath);
    }
    if (!fileInfo.isFile()) {
      sendText(response, 404, 'Not found\n');
      return;
    }

    const cacheControl = parsedUrl.pathname === '/' || parsedUrl.pathname.endsWith('/index.html')
      ? 'no-cache'
      : parsedUrl.pathname.startsWith('/assets/')
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=3600';

    response.writeHead(200, {
      ...securityHeaders,
      'Cache-Control': cacheControl,
      'Content-Length': fileInfo.size,
      'Content-Type': contentTypes.get(extname(filePath).toLowerCase()) ?? 'application/octet-stream'
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    const stream = createReadStream(filePath);
    stream.on('error', () => {
      if (!response.headersSent) {
        sendText(response, 500, 'Could not read file\n');
      } else {
        response.destroy();
      }
    });
    stream.pipe(response);
  } catch {
    sendText(response, 404, 'Not found\n');
  }
}

const server = createServer((request, response) => {
  serveFile(request, response).catch(() => {
    if (!response.headersSent) sendText(response, 500, 'Server error\n');
    else response.destroy();
  });
});

async function startServer() {
  const indexInfo = await stat(resolve(webRoot, 'index.html')).catch(() => null);
  if (!indexInfo?.isFile()) {
    throw new Error('Built site not found. Run npm run build before starting the server.');
  }

  server.listen(port, host, () => {
    console.log(`MAM Tours static site listening on ${host}:${port}`);
  });
}

startServer().catch((error) => {
  console.error(`MAM Tours server could not start: ${error.message}`);
  process.exitCode = 1;
});

// Let Railway finish active responses before stopping the process.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
