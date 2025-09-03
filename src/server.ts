import express, { Request, Response } from 'express';
import morgan from 'morgan';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

const app = express();
app.use(morgan('dev'));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const ORIGINAL_DIR = path.join(IMAGES_DIR, 'original');
const CACHE_DIR = path.join(IMAGES_DIR, 'cache');

async function ensureDirs() {
  await fs.mkdir(ORIGINAL_DIR, { recursive: true });
  await fs.mkdir(CACHE_DIR, { recursive: true });
}
ensureDirs().catch(console.error);

// fit المسموحة
const allowedFits = ['cover', 'contain', 'fill', 'inside', 'outside'] as const;
type FitMode = (typeof allowedFits)[number];
function normalizeFit(fit?: string): FitMode {
  const val = (fit as FitMode) || 'cover';
  return allowedFits.includes(val) ? val : 'cover';
}

/**
 * الحالة 1: رفع صورة + ترجيع الناتج بدون تخزين
 * POST /api/resize
 * form-data: image (file), width (opt), height (opt), fit (opt)
 */
app.post('/api/resize', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { width, height, fit } = req.body as Record<string, string>;
    const file = req.file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ error: 'image is required' });

    const w = width ? parseInt(width, 10) : null;
    const h = height ? parseInt(height, 10) : null;
    if (!w && !h) return res.status(400).json({ error: 'width or height required' });

    const buffer = await sharp(file.buffer)
      .resize({
        width: w || undefined,
        height: h || undefined,
        fit: normalizeFit(fit),
        withoutEnlargement: true,
      })
      .toFormat('jpeg')
      .jpeg({ quality: 85 })
      .toBuffer();

    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'processing_failed' });
  }
});

/**
 * الحالة 2: صور من فولدر + كاش
 * GET /api/image?name=sample.jpg&width=300&height=300&fit=contain
 */
app.get('/api/image', async (req: Request, res: Response) => {
  try {
    const { name, width, height, fit } = req.query as Record<string, string>;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const w = width ? parseInt(width, 10) : null;
    const h = height ? parseInt(height, 10) : null;
    if (!w && !h) return res.status(400).json({ error: 'width or height required' });

    const ext = path.extname(name) || '.jpg';
    const base = path.basename(name, ext);

    const cacheName = `${base}_${w || ''}x${h || ''}_${normalizeFit(fit)}.jpg`;
    const cachePath = path.join(CACHE_DIR, cacheName);

    // موجودة بالكاش؟
    try {
      await fs.access(cachePath);
      return res.sendFile(cachePath);
    } catch {
      // مش موجودة
    }

    const originalPath = path.join(ORIGINAL_DIR,` ${base}${ext}`);
    const exists = await fs
      .access(originalPath)
      .then(() => true)
      .catch(() => false);
    if (!exists) return res.status(404).json({ error: 'original_not_found' });

    const buffer = await sharp(originalPath)
      .resize({
        width: w || undefined,
        height: h || undefined,
        fit: normalizeFit(fit),
        withoutEnlargement: true,
      })
      .toFormat('jpeg')
      .jpeg({ quality: 85 })
      .toBuffer();

    await fs.writeFile(cachePath, buffer);
    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'processing_failed' });
  }
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;