import { FileStats, StatsService, StatsSnapshot } from './types';

export function createStatsService(): StatsService {
  let stats: Record<string, { gets: number; heads: number }> = {};

  function ensureEntry(filename: string): { gets: number; heads: number } {
    if (!stats[filename]) {
      stats[filename] = { gets: 0, heads: 0 };
    }
    return stats[filename];
  }

  return {
    incrementGet(filename: string): void {
      ensureEntry(filename).gets++;
    },

    incrementHead(filename: string): void {
      ensureEntry(filename).heads++;
    },

    getSnapshot(): StatsSnapshot {
      const byFile: Record<string, FileStats> = {};

      for (const [name, entry] of Object.entries(stats)) {
        byFile[name] = { gets: entry.gets, heads: entry.heads };
      }

      const totalGets = Object.values(stats).reduce((sum, s) => sum + s.gets, 0);
      const totalHeads = Object.values(stats).reduce((sum, s) => sum + s.heads, 0);

      return { totalGets, totalHeads, byFile };
    },

    reset(): void {
      stats = {};
    },
  };
}
