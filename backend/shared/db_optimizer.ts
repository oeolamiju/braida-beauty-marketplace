import { SQLDatabase } from 'encore.dev/storage/sqldb';

type Row = Record<string, any>;

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class QueryBuilder {
  private conditions: string[] = [];
  private params: any[] = [];
  private paramCounter = 1;

  addCondition(condition: string, value: any): this {
    this.conditions.push(condition);
    this.params.push(value);
    this.paramCounter++;
    return this;
  }

  addOptionalCondition(field: string, value: any, operator = '='): this {
    if (value !== undefined && value !== null) {
      this.conditions.push(`${field} ${operator} $${this.paramCounter}`);
      this.params.push(value);
      this.paramCounter++;
    }
    return this;
  }

  addSearchCondition(fields: string[], searchTerm: string): this {
    if (searchTerm && searchTerm.trim()) {
      const searchConditions = fields.map(
        (field) => `${field} ILIKE $${this.paramCounter}`
      );
      this.conditions.push(`(${searchConditions.join(' OR ')})`);
      this.params.push(`%${searchTerm}%`);
      this.paramCounter++;
    }
    return this;
  }

  addDateRangeCondition(field: string, start?: Date, end?: Date): this {
    if (start) {
      this.conditions.push(`${field} >= $${this.paramCounter}`);
      this.params.push(start);
      this.paramCounter++;
    }
    if (end) {
      this.conditions.push(`${field} <= $${this.paramCounter}`);
      this.params.push(end);
      this.paramCounter++;
    }
    return this;
  }

  addInCondition(field: string, values: any[]): this {
    if (values && values.length > 0) {
      const placeholders = values.map((_, i) => `$${this.paramCounter + i}`).join(', ');
      this.conditions.push(`${field} IN (${placeholders})`);
      this.params.push(...values);
      this.paramCounter += values.length;
    }
    return this;
  }

  getWhereClause(): string {
    return this.conditions.length > 0 ? `WHERE ${this.conditions.join(' AND ')}` : '';
  }

  getParams(): any[] {
    return this.params;
  }

  getParamCounter(): number {
    return this.paramCounter;
  }
}

export async function executePaginatedQuery<T>(
  db: SQLDatabase,
  baseQuery: string,
  whereClause: string,
  params: any[],
  options: QueryOptions = {}
): Promise<PaginationResult<T>> {
  const {
    limit = 20,
    offset = 0,
    orderBy = 'created_at',
    orderDirection = 'DESC',
  } = options;

  const page = Math.floor(offset / limit) + 1;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM (${baseQuery}) AS base_query
    ${whereClause}
  `;

  const dataQuery = `
    SELECT *
    FROM (${baseQuery}) AS base_query
    ${whereClause}
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const [countResult, dataResult] = await Promise.all([
    db.rawQueryAll(countQuery, ...params) as Promise<any[]>,
    db.rawQueryAll(dataQuery, ...params, limit, offset) as Promise<T[]>,
  ]);

  const total = parseInt(String(countResult[0]?.total || '0'), 10);
  const totalPages = Math.ceil(total / limit);

  return {
    data: dataResult as T[],
    total,
    page,
    pageSize: limit,
    totalPages,
  };
}

export function buildPaginationParams(page: number = 1, pageSize: number = 20) {
  const limit = Math.min(Math.max(pageSize, 1), 100);
  const offset = Math.max((page - 1) * limit, 0);
  return { limit, offset };
}

export async function batchQuery<T = any>(
  db: SQLDatabase,
  query: string,
  paramSets: any[][],
  batchSize: number = 100
): Promise<T[][]> {
  const results: T[][] = [];
  
  for (let i = 0; i < paramSets.length; i += batchSize) {
    const batch = paramSets.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((params) => db.rawQueryAll(query, ...params) as Promise<T[]>)
    );
    results.push(...batchResults);
  }
  
  return results;
}

export function buildFullTextSearchQuery(
  searchFields: string[],
  searchTerm: string,
  language: string = 'english'
): { clause: string; param: string } {
  const tsVectorParts = searchFields.map((field) => `to_tsvector('${language}', ${field})`);
  const tsVector = tsVectorParts.join(' || ');
  
  const clause = `${tsVector} @@ plainto_tsquery('${language}', $)`;
  const param = searchTerm;
  
  return { clause, param };
}

export async function upsert<T = any>(
  db: SQLDatabase,
  table: string,
  data: Record<string, any>,
  conflictColumns: string[],
  updateColumns: string[]
): Promise<T> {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  
  const updateSet = updateColumns
    .map((col) => `${col} = EXCLUDED.${col}`)
    .join(', ');
  
  const query = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (${conflictColumns.join(', ')})
    DO UPDATE SET ${updateSet}
    RETURNING *
  `;
  
  const result = await db.rawQueryRow(query, ...values) as T | null;
  return result!;
}
