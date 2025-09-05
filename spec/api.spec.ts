import path from 'path';
import fs from 'fs';
import request from 'supertest';
import app from '../src/server';

const agent = request(app);
const sample = 'sample.jpg';

describe('API endpoints', () => {
  it('GET /api/images (happy path) should return 200 and image', async () => {
    const res = await agent.get(`/api/images?filename=${sample}&width=150&height=150`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image/);
  });

  it('GET /api/images missing params → 400', async () => {
    const res = await agent.get('/api/images');
    expect(res.status).toBe(400);
  });

  it('GET /api/images non-existing file → 404', async () => {
    const res = await agent.get(`/api/images?filename=nope.jpg&width=100&height=100`);
    expect(res.status).toBe(404);
  });

  it('POST /api/on-demand (happy path) should return 200 and image', async () => {
    const imgPath = path.join(process.cwd(), 'images', sample);
    const res = await agent
      .post('/api/on-demand')
      .field('width', '120')
      .field('height', '120')
      .attach('image', imgPath);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image/);
  });

  it('POST /api/on-demand missing image → 400', async () => {
    const res = await agent.post('/api/on-demand').field('width', '120').field('height', '120');
    expect(res.status).toBe(400);
  });
});

afterAll(() => {
  const out = path.join(process.cwd(), 'thumbs', 'sample-150x150.jpg');
  if (fs.existsSync(out)) fs.unlinkSync(out);
});