import path from 'path';
import fs from 'fs';
import resize from '../src/utils/resize';

describe('resize() utility', () => {
  const src = path.join(process.cwd(), 'images', 'sample.jpg');
  const out = path.join(process.cwd(), 'thumbs', 'sample-50x50.jpg');

  it('creates a resized file on disk (happy path)', async () => {
    await resize(src, out, 50, 50);
    expect(fs.existsSync(out)).toBeTrue();
  });

  afterAll(() => {
    if (fs.existsSync(out)) fs.unlinkSync(out);
  });
});