import { SQLDatabase } from 'encore.dev/storage/sqldb';

type Row = Record<string, any>;

export interface PoolConfig {
  maxConnections?: number;
  minConnections?: number;
  idleTimeoutMs?: number;
  connectionTimeoutMs?: number;
  statementTimeout?: number;
}

export class DatabasePool {
  private db: SQLDatabase;
  private config: Required<PoolConfig>;
  
  constructor(db: SQLDatabase, config: PoolConfig = {}) {
    this.db = db;
    this.config = {
      maxConnections: config.maxConnections || 20,
      minConnections: config.minConnections || 2,
      idleTimeoutMs: config.idleTimeoutMs || 30000,
      connectionTimeoutMs: config.connectionTimeoutMs || 10000,
      statementTimeout: config.statementTimeout || 30000,
    };
  }

  async rawQueryAll<T = any>(query: string, ...params: any[]): Promise<T[]> {
    await this.db.rawExec(`SET statement_timeout = ${this.config.statementTimeout}`);
    return this.db.rawQueryAll(query, ...params) as Promise<T[]>;
  }

  async rawQueryRow<T = any>(query: string, ...params: any[]): Promise<T | null> {
    await this.db.rawExec(`SET statement_timeout = ${this.config.statementTimeout}`);
    return this.db.rawQueryRow(query, ...params) as Promise<T | null>;
  }

  async rawExec(query: string, ...params: any[]): Promise<void> {
    await this.db.rawExec(`SET statement_timeout = ${this.config.statementTimeout}`);
    return this.db.rawExec(query, ...params);
  }

  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    const tx = await this.db.begin();
    try {
      const result = await callback(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.db.rawExec('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export function createOptimizedQuery(query: string): string {
  return query
    .replace(/\s+/g, ' ')
    .trim();
}

export function addIndexHints(
  query: string,
  hints: Record<string, string>
): string {
  let optimizedQuery = query;
  
  for (const [table, index] of Object.entries(hints)) {
    const pattern = new RegExp(`FROM\\s+${table}\\b`, 'gi');
    optimizedQuery = optimizedQuery.replace(
      pattern,
      `FROM ${table} USE INDEX (${index})`
    );
  }
  
  return optimizedQuery;
}

export interface QueryPerformanceMetrics {
  query: string;
  executionTime: number;
  rowsReturned: number;
  timestamp: Date;
}

export class QueryMonitor {
  private metrics: QueryPerformanceMetrics[] = [];
  private maxMetrics = 1000;

  recordQuery(query: string, executionTime: number, rowsReturned: number) {
    this.metrics.push({
      query: this.normalizeQuery(query),
      executionTime,
      rowsReturned,
      timestamp: new Date(),
    });

    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  private normalizeQuery(query: string): string {
    return query
      .replace(/\$\d+/g, '$?')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200);
  }

  getSlowQueries(thresholdMs: number = 1000): QueryPerformanceMetrics[] {
    return this.metrics
      .filter((m) => m.executionTime > thresholdMs)
      .sort((a, b) => b.executionTime - a.executionTime);
  }

  getAverageExecutionTime(query: string): number {
    const normalized = this.normalizeQuery(query);
    const matching = this.metrics.filter((m) => m.query === normalized);
    
    if (matching.length === 0) return 0;
    
    const total = matching.reduce((sum, m) => sum + m.executionTime, 0);
    return total / matching.length;
  }

  clear() {
    this.metrics = [];
  }
}
