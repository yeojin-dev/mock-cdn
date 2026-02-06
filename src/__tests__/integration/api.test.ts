import { describe, test, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { loadConfig } from '../../config';
import { createContainer, Container } from '../../application/container';

let app: Application;
let container: Container;

beforeAll(async () => {
  const configResult = loadConfig({
    PORT: '3999',
    LOG_LEVEL: 'silent',
    NODE_ENV: 'test',
  });

  if (configResult.isErr()) throw new Error('Config failed');
  container = createContainer(configResult.value);
  await container.initialize();
  app = container.app;
});

describe('GET /', () => {
  test('returns service status', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('Mock CDN');
    expect(res.body.status).toBe('running');
    expect(res.body.etagMode).toBe('consistent');
  });
});

describe('GET /health', () => {
  test('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /images/:filename', () => {
  test('returns image with correct headers', async () => {
    const res = await request(app).get('/images/test-image-1.jpg');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/jpeg/);
    expect(res.headers['etag']).toMatch(/^"[a-f0-9]{32}"$/);
    expect(res.headers['cache-control']).toBe('max-age=691200');
  });

  test('returns 404 for non-existent image', async () => {
    const res = await request(app).get('/images/nonexistent.jpg');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Image not found');
  });

  test('all 6 images available', async () => {
    for (let i = 1; i <= 6; i++) {
      const res = await request(app).get(`/images/test-image-${i}.jpg`);
      expect(res.status).toBe(200);
    }
  });
});

describe('HEAD /images/:filename', () => {
  test('returns headers without body', async () => {
    const res = await request(app).head('/images/test-image-1.jpg');
    expect(res.status).toBe(200);
    expect(res.headers['etag']).toMatch(/^"[a-f0-9]{32}"$/);
    expect(res.headers['content-type']).toMatch(/image\/jpeg/);
    expect(res.text).toBeFalsy();
  });
});

describe('GET /stats', () => {
  test('returns stats snapshot', async () => {
    const res = await request(app).get('/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalGets');
    expect(res.body).toHaveProperty('totalHeads');
    expect(res.body).toHaveProperty('byFile');
  });
});

describe('POST /reset-stats', () => {
  test('resets stats', async () => {
    await request(app).get('/images/test-image-1.jpg');
    const res = await request(app).post('/reset-stats');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Stats reset');
    expect(res.body.totalGets).toBe(0);
    expect(res.body.totalHeads).toBe(0);
  });
});

describe('POST /set-etag-mode', () => {
  test('switches to random mode', async () => {
    const res = await request(app)
      .post('/set-etag-mode')
      .send({ mode: 'random' });
    expect(res.status).toBe(200);
    expect(res.body.etagMode).toBe('random');
    expect(res.body.message).toBe('ETag mode updated');
  });

  test('switches back to consistent mode', async () => {
    const res = await request(app)
      .post('/set-etag-mode')
      .send({ mode: 'consistent' });
    expect(res.status).toBe(200);
    expect(res.body.etagMode).toBe('consistent');
  });

  test('rejects invalid mode', async () => {
    const res = await request(app)
      .post('/set-etag-mode')
      .send({ mode: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid mode');
  });

  test('rejects missing mode', async () => {
    const res = await request(app)
      .post('/set-etag-mode')
      .send({});
    expect(res.status).toBe(400);
  });
});
