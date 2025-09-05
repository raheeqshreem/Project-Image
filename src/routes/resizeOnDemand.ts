import express, { Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';

const router = express.Router();
const upload = multer();

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  const { width, height } = req.body;

  if (!req.file || !width || !height) {
    return res.status(400).send('Missing image or size params');
  }

  const w = parseInt(width, 10);
  const h = parseInt(height, 10);
  if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) {
    return res.status(400).send('Width/height must be positive numbers');
  }

  try {
    const buffer = await sharp(req.file.buffer).resize(w, h).toFormat('jpeg').toBuffer();
    res.type('jpeg').status(200).send(buffer);
  } catch {
    res.status(500).send('Error processing image');
  }
});

export default router;