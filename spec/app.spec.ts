import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../src/server';

describe('Image API', () => {
  it('POST /api/resize returns resized image (no save)', async () => {
    const imgPath = path.join(__dirname, 'fixtures', 'sample.jpg');
    if (!fs.existsSync(imgPath)) {
      pending('Add a small image at spec/fixtures/sample.jpg to run this test.');
    }
    const res = await request(app)
      .post('/api/resize')
      .field('width', '200')
      .attach('image', imgPath);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain(`image/jpeg`);
    expect(res.body.length).toBeGreaterThan(100);
  });

  it('GET /api/image serves cached image on second call', async () => {
    const origPath = path.join(__dirname, '..', 'images', 'original', 'sample.jpg');
    if (!fs.existsSync(origPath)) {
      pending('Add a small image at images/original/sample.jpg to run this test.');
    }
    const url = '/api/image?name=sample.jpg&width=150';
    const first = await request(app).get(url);
    expect(first.status).toBe(200);
    expect(first.headers['content-type']).toContain(`image/jpeg`);

    const second = await request(app).get(url);
    expect(second.status).toBe(200);
    expect(second.body.length).toBe(first.body.length);
  });
});