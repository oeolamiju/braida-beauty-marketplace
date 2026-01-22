import { SQLDatabase } from 'encore.dev/storage/sqldb';

export async function createIndexes(db: SQLDatabase): Promise<void> {
  const indexes = [
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_user_id ON bookings(user_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_freelancer_id ON bookings(freelancer_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_status ON bookings(status)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_scheduled_time ON bookings(scheduled_time)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC)',
    
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_freelancer_id ON services(freelancer_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_active ON services(is_active)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_category ON services(category)',
    
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role)',
    
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_freelancer_id ON reviews(freelancer_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id)',
    
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON notifications(is_read)',
    
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_booking_id ON payments(booking_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status ON payments(status)',
  ];

  for (const indexQuery of indexes) {
    try {
      await db.rawExec(indexQuery);
    } catch (error) {
      console.error(`Failed to create index: ${indexQuery}`, error);
    }
  }
}

export async function analyzeTable(db: SQLDatabase, tableName: string): Promise<void> {
  await db.rawExec(`ANALYZE ${tableName}`);
}

export async function vacuumTable(db: SQLDatabase, tableName: string): Promise<void> {
  await db.rawExec(`VACUUM ANALYZE ${tableName}`);
}

export async function getTableStats(
  db: SQLDatabase,
  tableName: string
): Promise<{
  rowCount: number;
  tableSize: string;
  indexSize: string;
  totalSize: string;
}> {
  const result = await db.rawQueryRow(`
    SELECT
      reltuples::bigint AS row_count,
      pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
      pg_size_pretty(pg_relation_size(relid)) AS table_size,
      pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
    FROM pg_catalog.pg_statio_user_tables
    WHERE relname = $1
  `, tableName);

  return {
    rowCount: result?.row_count || 0,
    tableSize: result?.table_size || '0 bytes',
    indexSize: result?.index_size || '0 bytes',
    totalSize: result?.total_size || '0 bytes',
  };
}

export async function getIndexUsage(
  db: SQLDatabase,
  tableName: string
): Promise<Array<{
  indexName: string;
  indexScans: number;
  tuplesFetched: number;
}>> {
  const result = await db.rawQueryAll(`
    SELECT
      indexrelname AS index_name,
      idx_scan AS index_scans,
      idx_tup_fetch AS tuples_fetched
    FROM pg_stat_user_indexes
    WHERE relname = $1
    ORDER BY idx_scan DESC
  `, tableName);

  return result.map((row: any) => ({
    indexName: row.index_name,
    indexScans: parseInt(row.index_scans || '0', 10),
    tuplesFetched: parseInt(row.tuples_fetched || '0', 10),
  }));
}

export async function explainQuery(
  db: SQLDatabase,
  query: string,
  params: any[] = []
): Promise<string[]> {
  const explainQuery = `EXPLAIN ANALYZE ${query}`;
  const result = await db.rawQueryAll(explainQuery, ...params);
  
  return result.map((row: any) => row['QUERY PLAN'] || JSON.stringify(row));
}

export function optimizeSelectQuery(query: string): string {
  let optimized = query;
  
  if (!optimized.includes('LIMIT')) {
    optimized = optimized.trim();
    if (optimized.endsWith(';')) {
      optimized = optimized.slice(0, -1);
    }
    optimized += ' LIMIT 1000';
  }
  
  return optimized;
}

export async function createPartitionedTable(
  db: SQLDatabase,
  tableName: string,
  partitionColumn: string,
  partitionType: 'RANGE' | 'LIST' | 'HASH' = 'RANGE'
): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName}_partitioned (
      LIKE ${tableName} INCLUDING ALL
    ) PARTITION BY ${partitionType} (${partitionColumn})
  `;
  
  await db.rawExec(query);
}
