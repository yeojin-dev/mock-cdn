export interface FileStats {
  readonly gets: number;
  readonly heads: number;
}

export interface StatsSnapshot {
  readonly totalGets: number;
  readonly totalHeads: number;
  readonly byFile: Readonly<Record<string, FileStats>>;
}

export interface StatsService {
  readonly incrementGet: (filename: string) => void;
  readonly incrementHead: (filename: string) => void;
  readonly getSnapshot: () => StatsSnapshot;
  readonly reset: () => void;
}
