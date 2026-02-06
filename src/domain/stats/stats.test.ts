import { describe, test, expect, beforeEach } from 'vitest';
import { createStatsService } from './service';

describe('Stats Service', () => {
  let service: ReturnType<typeof createStatsService>;

  beforeEach(() => {
    service = createStatsService();
  });

  test('starts with zero totals', () => {
    const snapshot = service.getSnapshot();
    expect(snapshot.totalGets).toBe(0);
    expect(snapshot.totalHeads).toBe(0);
    expect(Object.keys(snapshot.byFile)).toHaveLength(0);
  });

  test('incrementGet tracks file gets', () => {
    service.incrementGet('test-image-1.jpg');
    service.incrementGet('test-image-1.jpg');
    service.incrementGet('test-image-2.jpg');

    const snapshot = service.getSnapshot();
    expect(snapshot.totalGets).toBe(3);
    expect(snapshot.byFile['test-image-1.jpg'].gets).toBe(2);
    expect(snapshot.byFile['test-image-2.jpg'].gets).toBe(1);
  });

  test('incrementHead tracks file heads', () => {
    service.incrementHead('test-image-1.jpg');

    const snapshot = service.getSnapshot();
    expect(snapshot.totalHeads).toBe(1);
    expect(snapshot.byFile['test-image-1.jpg'].heads).toBe(1);
    expect(snapshot.byFile['test-image-1.jpg'].gets).toBe(0);
  });

  test('reset clears all stats', () => {
    service.incrementGet('test-image-1.jpg');
    service.incrementHead('test-image-2.jpg');
    service.reset();

    const snapshot = service.getSnapshot();
    expect(snapshot.totalGets).toBe(0);
    expect(snapshot.totalHeads).toBe(0);
    expect(Object.keys(snapshot.byFile)).toHaveLength(0);
  });

  test('getSnapshot returns immutable copy', () => {
    service.incrementGet('test.jpg');
    const snapshot1 = service.getSnapshot();

    service.incrementGet('test.jpg');
    const snapshot2 = service.getSnapshot();

    expect(snapshot1.totalGets).toBe(1);
    expect(snapshot2.totalGets).toBe(2);
  });

  test('mixed gets and heads for same file', () => {
    service.incrementGet('file.jpg');
    service.incrementGet('file.jpg');
    service.incrementHead('file.jpg');

    const snapshot = service.getSnapshot();
    expect(snapshot.byFile['file.jpg'].gets).toBe(2);
    expect(snapshot.byFile['file.jpg'].heads).toBe(1);
    expect(snapshot.totalGets).toBe(2);
    expect(snapshot.totalHeads).toBe(1);
  });
});
