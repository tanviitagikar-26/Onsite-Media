import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function uploadPhotoPlugin(): Plugin {
  return {
    name: 'upload-photo-plugin',
    configureServer(server) {
      server.middlewares.use('/api/upload-photo', (req: any, res: any) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (data.base64) {
                const base64Data = data.base64.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const publicDir = path.resolve(__dirname, 'public');
                const imagesDir = path.resolve(publicDir, 'images');
                if (!fs.existsSync(imagesDir)) {
                  fs.mkdirSync(imagesDir, { recursive: true });
                }

                if (Array.isArray(data.files)) {
                  for (const f of data.files) {
                    if (f.base64 && f.filename) {
                      const buf = Buffer.from(f.base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                      fs.writeFileSync(path.resolve(publicDir, f.filename), buf);
                      fs.writeFileSync(path.resolve(imagesDir, f.filename), buf);
                    }
                  }
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, count: data.files.length }));
                  return;
                }

                if (data.filename) {
                  fs.writeFileSync(path.resolve(publicDir, data.filename), buffer);
                  fs.writeFileSync(path.resolve(imagesDir, data.filename), buffer);
                } else {
                  fs.writeFileSync(path.resolve(imagesDir, 'original_concert_singer.jpg'), buffer);
                  fs.writeFileSync(
                    path.resolve(publicDir, 'SaveInta.com_758469193_18089254955417540_9161247027050578589_n.jpg'),
                    buffer
                  );
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, url: data.filename ? `/${data.filename}` : '/images/original_concert_singer.jpg' }));
                return;
              }
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err?.message || 'Server error' }));
              return;
            }
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing base64' }));
          });
        } else {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), uploadPhotoPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
