import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Cloudinary with user credentials
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'ehc1fewm';
const API_KEY = process.env.CLOUDINARY_API_KEY || '222139937659655';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'CUidagGOF8eVgV00bq2cTPOvbu8';

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cloudinary Configuration Info (Public)
app.get('/api/cloudinary/status', (_req, res) => {
  res.json({
    status: 'connected',
    cloudName: CLOUD_NAME,
    hasApiKey: !!API_KEY,
    hasApiSecret: !!API_SECRET,
  });
});

// Cloudinary Server-Side Secure Upload Endpoint
app.post('/api/cloudinary/upload', async (req, res) => {
  try {
    const { file, folder = 'dare_arqam_media', resource_type = 'auto' } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: resource_type as any,
    });

    return res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at,
    });
  } catch (error: any) {
    console.error('Cloudinary Server Upload Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload media to Cloudinary',
    });
  }
});

// Cloudinary Delete Asset Endpoint
app.post('/api/cloudinary/delete', async (req, res) => {
  try {
    const { publicId, resource_type = 'image' } = req.body;
    if (!publicId) {
      return res.status(400).json({ success: false, error: 'publicId is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resource_type as any,
    });

    return res.json({ success: true, result });
  } catch (error: any) {
    console.error('Cloudinary Delete Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete asset from Cloudinary',
    });
  }
});

// Mount Vite in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Educational Portal Server with Cloudinary running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
