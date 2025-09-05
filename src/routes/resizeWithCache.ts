import fs from 'fs';
import path from 'path';
import express from 'express';
import resize from '../utils/resize';

const router = express.Router();

router.get('/', async (req, res) => {
  const { filename, width, height } = req.query;

  if (!filename || !width || !height) {
    return res.status(400).send('Missing parameters');
  }

  const inputPath = path.join(process.cwd(), 'images', filename as string);

  if (!fs.existsSync(inputPath)) {
    return res.status(404).send('File not found');
  }

  const outputPath = path.join(
    process.cwd(),
    'thumbs',
    `${path.parse(filename as string).name}-${width}x${height}.jpg`
  );

  try {
    const thumbsDir = path.join(process.cwd(), 'thumbs');
    if (!fs.existsSync(thumbsDir)) {
      fs.mkdirSync(thumbsDir);
    }

    console.log(' Input Path:', inputPath);
    console.log(' Output Path:', outputPath);

    if (fs.existsSync(outputPath)) {
      console.log(' Using cached image');
      return res.status(200).sendFile(outputPath);
    }

    console.log(' Resizing image...');
    await resize(
      inputPath,
      outputPath,
      parseInt(width as string),
      parseInt(height as string)
    );

    console.log(' Resize complete, sending file');
    return res.status(200).sendFile(outputPath);
  } catch (err) {
    console.error(' Error while processing image:', err);
    return res.status(500).send('Error processing image');
  }
});

export default router;