export interface QueryOptions {
  parse: boolean;
}

export interface DatabaseConfig {
  debug?: boolean;
}

export interface SQLiteConfig extends DatabaseConfig {
  db: string | URL;
  sql: string | URL;
  tables: string | URL;
  views: string | URL;
  extensions?: string | URL | Array<string | URL>;
  adaptor: any;
}

export interface TursoConfig extends DatabaseConfig {
  db: any;
  files: any;
}

export interface D1Config extends DatabaseConfig {
  db: any;
  files: any;
  getSample?: any;
}

export interface FileSystem {
  readFile: (path: string, encoding: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  readdir: (path: string) => Promise<string[]>;
  join: (...paths: string[]) => string;
  readSql: (path: string) => Promise<string>;
}

export interface Paths {
  tables: string;
  views: string;
  sql: string;
  types: string;
  migrations: string;
  wrangler?: string;
  files?: string;
}

export class Database {
  constructor(options: DatabaseConfig);
  runMigration(sql: string): Promise<void>;
  makeTypes(fileSystem: FileSystem, paths: Paths, sampleData?: boolean): Promise<void>;
  getClient(): TypedDb;
  getTables(): Promise<string>;
  createMigration(fileSystem: FileSystem, paths: Paths, name: string, reset?: boolean): Promise<string>;
  run(args: { query: any, params?: any }): Promise<number>;
  all<T>(args: { query: any, params?: any, options?: QueryOptions }): Promise<Array<T>>;
  exec(query: string): Promise<void>;
}

export class SQLiteDatabase extends Database {
  constructor(options: SQLiteConfig);
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  close(): Promise<void>;
}

export class TursoDatabase extends Database {
  constructor(options: TursoConfig);
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  batch(handler: (batcher: any) => any[]): Promise<any[]>;
}

export class D1Database extends Database {
  constructor(options: D1Config);
  batch(handler: (batcher: any) => any[]): Promise<any[]>;
}

type ExtractKeys<U> = U extends Record<string, any> ? keyof U : keyof {};

export interface Keywords<T> {
  orderBy?: T;
  desc?: boolean;
  limit?: number;
  offset?: number;
  distinct?: boolean;
}

export interface Includes<T, R> {
  [key: string]: (tables: T, columns: R) => any;
}

type ObjectFunction = {
  [key: string]: (...args: any) => any;
}

type MergeIncludes<T, U extends ObjectFunction> = 
  T & { [K in keyof U]: ReturnType<U[K]> extends Promise<infer R> ? R : never;
};

type ReturnTypes<T extends ObjectFunction> = {
  [K in keyof T]: ReturnType<T[K]>;
};

type ConvertAlias<T, U extends ObjectFunction> = 
  T & { [K in keyof U]: ReturnType<U[K]> extends Promise<infer R> ? R : never;
};

type IncludeWhere<U extends ObjectFunction> = {
  [K in keyof U]: ReturnType<U[K]> extends Promise<infer R>
    ? R extends string | number | Date | boolean ? R | Array<R> | WhereFunction<R> | null : never : never;
}

export interface VirtualKeywords<T> {
  rank?: true;
  bm25?: Record<keyof Omit<T, "rowid">, number>;
  limit?: number;
  offset?: number;
}

export interface Highlight<T> extends VirtualKeywords<T> {
  highlight: { column: keyof T, tags: [string, string] };
}

export interface Snippet<T> extends VirtualKeywords<T> {
  snippet: { column: keyof T, tags: [string, string], trailing: string, tokens: number };
}

export interface HighlightQuery<W, T> extends Highlight<T> {
  where?: W;
}

export interface SnippetQuery<W, T> extends Snippet<T> {
  where?: W;
}

export interface VirtualQuery<W, T> extends VirtualKeywords<T> {
  where?: W;
}

export interface VirtualQueryObject<W, K, T> extends VirtualQuery<W, T> {
  select: (keyof T)[] | K[];
}

export interface VirtualQueryValue<W, K, T> extends VirtualQuery<W, T> {
  select: K;
}

export interface VirtualQuerySelector<W, T, N> extends VirtualQuery<W, T> {
  select: (selector: T) => N;
}

export interface AggregateQuery<W, K> {
  where?: W;
  column?: K;
  distinct?: K;
}

export interface AggregateQueryDebug<W, K> extends AggregateQuery<W, K> {
  debug: true;
}

export interface AggregateGroupQuery<T> {
  column?: keyof T;
  distinct?: keyof T;
}

export interface AggregateSelector<T> {
  count: (options?: AggregateGroupQuery<T>) => number;
  avg: (options: AggregateGroupQuery<T>) => number;
  min: (options: AggregateGroupQuery<T>) => number;
  max: (options: AggregateGroupQuery<T>) => number;
  sum: (options: AggregateGroupQuery<T>) => number;
  array<K extends keyof T>(select: K[]) : Array<Pick<T, K>>;
  array<K extends keyof T>(select: K) : Array<T[K]>;
  array() : Array<T>;
}

export interface Alias<T> {
  [key: string]: (columns: T) => any;
}

type PrimitiveMatch = string | number | Date | boolean;

type TransformAlias<T extends ObjectFunction> = {
  [K in keyof T as ReturnType<T[K]> extends PrimitiveMatch ? K : never]:
    ReturnType<T[K]> | Array<ReturnType<T[K]>> | WhereFunction<ReturnType<T[K]>> | null;
};

export interface GroupResult<T> {
  group: T[];
}

export interface GroupAlias<T> {
  [key: string]: (aggregate: AggregateSelector<T>) => any;
}

export interface GroupQueryAlias<W, T, K extends keyof T, U extends ObjectFunction> extends Keywords<keyof T | ExtractKeys<U> | Array<keyof T | ExtractKeys<U>>> {
  by: K | (keyof T)[] | K[];
  alias: U;
  where?: W | Partial<TransformAlias<U>>;
}

export interface GroupQueryAliasDebug<W, T, K extends keyof T, U extends ObjectFunction> extends GroupQueryAlias<W, T, K, U> {
  debug: true;
}

export interface GroupQueryObject<W, B> extends Keywords<B> {
  by: B;
  alias: undefined;
  where?: W;
}

export interface GroupQueryObjectDebug<W, B> extends GroupQueryObject<W, B> {
  debug: true;
}

export interface ComplexQuery<W, T> extends Keywords<Array<keyof T> | keyof T> {
  where?: W;
  select?: undefined;
  include?: undefined;
  alias?: undefined;
}

export interface ComplexSqlQueryParamsUnsafe<P, U, W, T> extends ComplexQuery<W, T> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryParams<P, W, T> extends ComplexQuery<W, T> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryUnsafe<U, W, T> extends ComplexQuery<W, T> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQuery<W, T> extends ComplexQuery<W, T> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryParamsUnsafeDebug<P, W, T, U> extends ComplexSqlQueryParamsUnsafe<P, W, T, U> {
  debug: true;
}

export interface ComplexSqlQueryParamsDebug<P, W, T> extends ComplexSqlQueryParams<P, W, T> {
  debug: true;
}

export interface ComplexSqlQueryUnsafeDebug<U, W, T> extends ComplexSqlQueryUnsafe<U, W, T> {
  debug: true;
}

export interface ComplexSqlQueryDebug<W, T> extends ComplexSqlQuery<W, T> {
  debug: true;
}

export interface ComplexQueryDebug<W, T> extends ComplexQuery<W, T> {
  debug: true;
}

export interface ComplexQueryAlias<W, T, N extends ObjectFunction> extends Keywords<Array<keyof T | ExtractKeys<N>> | keyof T | ExtractKeys<N>> {
  where?: W | Partial<TransformAlias<N>>;
  select?: undefined;
  include?: undefined;
  alias: N;
}

export interface ComplexSqlQueryAliasParamsUnsafe<P, U, W, T, N extends ObjectFunction> extends ComplexQueryAlias<W, T, N> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryAliasParams<P, W, T, N extends ObjectFunction> extends ComplexQueryAlias<W, T, N> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryAliasUnsafe<U, W, T, N extends ObjectFunction> extends ComplexQueryAlias<W, T, N> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryAlias<W, T, N extends ObjectFunction> extends ComplexQueryAlias<W, T, N> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryAliasParamsUnsafeDebug<P, U, W, T, N extends ObjectFunction> extends ComplexSqlQueryAliasParamsUnsafe<P, U, W, T, N> {
  debug: true;
}

export interface ComplexSqlQueryAliasParamsDebug<P, W, T, N extends ObjectFunction> extends ComplexSqlQueryAliasParams<P, W, T, N> {
  debug: true;
}

export interface ComplexSqlQueryAliasUnsafeDebug<U, W, T, N extends ObjectFunction> extends ComplexSqlQueryAliasUnsafe<U, W, T, N> {
  debug: true;
}

export interface ComplexSqlQueryAliasDebug<W, T, N extends ObjectFunction> extends ComplexSqlQueryAlias<W, T, N> {
  debug: true;
}

export interface ComplexQueryAliasDebug<W, T, N> extends ComplexQueryAlias<W, T, N> {
  debug: true;
}

export interface ComplexQueryInclude<W, T, U extends ObjectFunction> extends Keywords<Array<keyof T | ExtractKeys<U>> | keyof T | ExtractKeys<U>> {
  where?: W | Partial<IncludeWhere<U>>;
  select?: undefined;
  include: U;
  alias?: undefined;
}

export interface ComplexSqlQueryIncludeParamsUnsafe<P, U, W, T, R extends ObjectFunction> extends ComplexQueryInclude<W, T, R> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryIncludeParams<P, W, T, R extends ObjectFunction> extends ComplexQueryInclude<W, T, R> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryIncludeUnsafe<U, W, T, R extends ObjectFunction> extends ComplexQueryInclude<W, T, R> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryInclude<W, T, R extends ObjectFunction> extends ComplexQueryInclude<W, T, R> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryIncludeParamsUnsafeDebug<P, U, W, T, R extends ObjectFunction> extends ComplexSqlQueryIncludeParamsUnsafe<P, U, W, T, R> {
  debug: true;
}

export interface ComplexSqlQueryIncludeParamsDebug<P, W, T, R extends ObjectFunction> extends ComplexSqlQueryIncludeParams<P, W, T, R> {
  debug: true;
}

export interface ComplexSqlQueryIncludeUnsafeDebug<U, W, T, R extends ObjectFunction> extends ComplexSqlQueryIncludeUnsafe<U, W, T, R> {
  debug: true;
}

export interface ComplexSqlQueryIncludeDebug<W, T, R extends ObjectFunction> extends ComplexSqlQueryInclude<W, T, R> {
  debug: true;
}

export interface ComplexQueryIncludeDebug<W, T, U extends ObjectFunction> extends ComplexQueryInclude<W, T, U> {
  debug: true;
}

export interface ComplexQueryIncludeAlias<W, T, U extends ObjectFunction, N extends ObjectFunction> extends Keywords<Array<keyof T | ExtractKeys<U & N>> | keyof T | ExtractKeys<U & N>> {
  where?: W | Partial<IncludeWhere<U>> | Partial<TransformAlias<N>>;
  select?: undefined;
  include: U;
  alias: N;
}

export interface ComplexSqlQueryIncludeAliasParamsUnsafe<P, U, W, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryIncludeAlias<W, T, R, N> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryIncludeAliasParams<P, W, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryIncludeAlias<W, T, R, N> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryIncludeAliasUnsafe<U, W, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryIncludeAlias<W, T, R, N> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryIncludeAlias<W, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryIncludeAlias<W, T, R, N> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryIncludeAliasParamsUnsafeDebug<P, U, W, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexSqlQueryIncludeAliasParamsUnsafe<P, U, W, T, R, N> {
  debug: true;
}

export interface ComplexSqlQueryIncludeAliasParamsDebug<P, W, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexSqlQueryIncludeAliasParams<P, W, T, R, N> {
  debug: true;
}

export interface ComplexSqlQueryIncludeAliasUnsafeDebug<U, W, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexSqlQueryIncludeAliasUnsafe<U, W, T, R, N> {
  debug: true;
}

export interface ComplexSqlQueryIncludeAliasDebug<W, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexSqlQueryIncludeAlias<W, T, R, N> {
  debug: true;
}

export interface ComplexQueryIncludeAliasDebug<W, T, U extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryIncludeAlias<W, T, U, N> {
  debug: true;
}

export interface ComplexQueryAlias<W, T, N> extends Keywords<Array<keyof T | ExtractKeys<N>> | keyof T | ExtractKeys<N>> {
  where?: W | Partial<TransformAlias<N>>;
  select?: undefined;
  include?: undefined;
  alias: N;
}

export interface ComplexSqlQueryAliasParamsUnsafe<P, U, W, T, N> extends ComplexQueryAlias<W, T, N> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryAliasParams<P, W, T, N> extends ComplexQueryAlias<W, T, N> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryAliasUnsafe<U, W, T, N> extends ComplexQueryAlias<W, T, N> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryAlias<W, T, N> extends ComplexQueryAlias<W, T, N> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryAliasParamsUnsafeDebug<P, U, W, T, N extends ObjectFunction> extends ComplexSqlQueryAliasParamsUnsafe<P, U, W, T, N> {
  debug: true;
}

export interface ComplexSqlQueryAliasParamsDebug<P, W, T, N extends ObjectFunction> extends ComplexSqlQueryAliasParams<P, W, T, N> {
  debug: true;
}

export interface ComplexSqlQueryAliasUnsafeDebug<U, W, T, N extends ObjectFunction> extends ComplexSqlQueryAliasUnsafe<U, W, T, N> {
  debug: true;
}

export interface ComplexSqlQueryAliasDebug<W, T, N extends ObjectFunction> extends ComplexSqlQueryAlias<W, T, N> {
  debug: true;
}

export interface ComplexQueryAliasDebug<W, T, N extends ObjectFunction> extends ComplexQueryAlias<W, T, N> {
  debug: true;
}

export interface ComplexQueryObject<W, K, T> extends Keywords<keyof T | Array<keyof T>> {
  where?: W;
  select: (keyof T)[] | K[];
  include?: undefined;
  alias?: undefined;
}

export interface ComplexSqlQueryObjectParamsUnsafe<P, U, W, K, T> extends ComplexQueryObject<W, K, T> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryObjectParams<P, W, K, T> extends ComplexQueryObject<W, K, T> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectUnsafe<U, W, K, T> extends ComplexQueryObject<W, K, T> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryObject<W, K, T> extends ComplexQueryObject<W, K, T> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectParamsUnsafeDebug<P, U, W, K, T> extends ComplexSqlQueryObjectParamsUnsafe<P, U, W, K, T> {
  debug: true;
}

export interface ComplexSqlQueryObjectParamsDebug<P, W, K, T> extends ComplexSqlQueryObjectParams<P, W, K, T> {
  debug: true;
}

export interface ComplexSqlQueryObjectUnsafeDebug<U, W, K, T> extends ComplexSqlQueryObjectUnsafe<U, W, K, T> {
  debug: true;
}

export interface ComplexSqlQueryObjectDebug<W, K, T> extends ComplexSqlQueryObject<W, K, T> {
  debug: true;
}

export interface ComplexQueryObjectDebug<W, K, T> extends ComplexQueryObject<W, K, T> {
  debug: true;
}

export interface ComplexQueryObjectOmit<W, K, T> extends Keywords<keyof T | Array<keyof T>> {
  where?: W;
  select?: undefined;
  omit: (keyof T)[] | K[] | K;
  include?: undefined;
  alias?: undefined;
}

export interface ComplexSqlQueryObjectOmitParamsUnsafe<P, U, W, K, T> extends ComplexQueryObjectOmit<W, K, T> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryObjectOmitParams<P, W, K, T> extends ComplexQueryObjectOmit<W, K, T> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectOmitUnsafe<U, W, K, T> extends ComplexQueryObjectOmit<W, K, T> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryObjectOmit<W, K, T> extends ComplexQueryObjectOmit<W, K, T> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectOmitParamsUnsafeDebug<P, U, W, K, T> extends ComplexSqlQueryObjectOmitParamsUnsafe<P, U, W, K, T> {
  debug: true;
}

export interface ComplexSqlQueryObjectOmitParamsDebug<P, W, K, T> extends ComplexSqlQueryObjectOmitParams<P, W, K, T> {
  debug: true;
}

export interface ComplexSqlQueryObjectOmitUnsafeDebug<U, W, K, T> extends ComplexSqlQueryObjectOmitUnsafe<U, W, K, T> {
  debug: true;
}

export interface ComplexSqlQueryObjectOmitDebug<W, K, T> extends ComplexSqlQueryObjectOmit<W, K, T> {
  debug: true;
}

export interface ComplexQueryObjectOmitDebug<W, K, T> extends ComplexQueryObjectOmit<W, K, T> {
  debug: true;
}

export interface ComplexQueryObjectAlias<W, K, T, N extends ObjectFunction> extends Keywords<keyof T | ExtractKeys<N> | Array<keyof T | ExtractKeys<N>>> {
  where?: W | Partial<TransformAlias<N>>;
  select: (keyof T)[] | K[];
  include?: undefined;
  alias: N;
}

export interface ComplexSqlQueryObjectAliasParamsUnsafe<P, U, W, K, T, N extends ObjectFunction> extends ComplexQueryObjectAlias<W, K, T, N> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryObjectAliasParams<P, W, K, T, N extends ObjectFunction> extends ComplexQueryObjectAlias<W, K, T, N> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectAliasUnsafe<U, W, K, T, N extends ObjectFunction> extends ComplexQueryObjectAlias<W, K, T, N> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryObjectAlias<W, K, T, N extends ObjectFunction> extends ComplexQueryObjectAlias<W, K, T, N> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectAliasParamsUnsafeDebug<P, U, W, K, T, N extends ObjectFunction> extends ComplexSqlQueryObjectAliasParamsUnsafe<P, U, W, K, T, N> {
  debug: true;
}

export interface ComplexSqlQueryObjectAliasParamsDebug<P, W, K, T, N extends ObjectFunction> extends ComplexSqlQueryObjectAliasParams<P, W, K, T, N> {
  debug: true;
}

export interface ComplexSqlQueryObjectAliasUnsafeDebug<U, W, K, T, N extends ObjectFunction> extends ComplexSqlQueryObjectAliasUnsafe<U, W, K, T, N> {
  debug: true;
}

export interface ComplexSqlQueryObjectAliasDebug<W, K, T, N extends ObjectFunction> extends ComplexSqlQueryObjectAlias<W, K, T, N> {
  debug: true;
}

export interface ComplexQueryObjectAliasDebug<W, K, T, N extends ObjectFunction> extends ComplexQueryObjectAlias<W, K, T, N> {
  debug: true;
}

export interface ComplexQueryObjectAliasOmit<W, K, T, N extends ObjectFunction> extends Keywords<keyof T | ExtractKeys<N> | Array<keyof T | ExtractKeys<N>>> {
  where?: W | Partial<TransformAlias<N>>;
  select?: undefined;
  omit: (keyof T)[] | K[] | K;
  include?: undefined;
  alias: N;
}

export interface ComplexSqlQueryObjectAliasOmitParamsUnsafe<P, U, W, K, T, N extends ObjectFunction> extends ComplexQueryObjectAliasOmit<W, K, T, N> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryObjectAliasOmitParams<P, W, K, T, N extends ObjectFunction> extends ComplexQueryObjectAliasOmit<W, K, T, N> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectAliasOmitUnsafe<U, W, K, T, N extends ObjectFunction> extends ComplexQueryObjectAliasOmit<W, K, T, N> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryObjectAliasOmit<W, K, T, N extends ObjectFunction> extends ComplexQueryObjectAliasOmit<W, K, T, N> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectAliasOmitParamsUnsafeDebug<P, U, W, K, T, N extends ObjectFunction> extends ComplexSqlQueryObjectAliasOmitParamsUnsafe<P, U, W, K, T, N> {
  debug: true;
}

export interface ComplexSqlQueryObjectAliasOmitParamsDebug<P, W, K, T, N extends ObjectFunction> extends ComplexSqlQueryObjectAliasOmitParams<P, W, K, T, N> {
  debug: true;
}

export interface ComplexSqlQueryObjectAliasOmitUnsafeDebug<U, W, K, T, N extends ObjectFunction> extends ComplexSqlQueryObjectAliasOmitUnsafe<U, W, K, T, N> {
  debug: true;
}

export interface ComplexSqlQueryObjectAliasOmitDebug<W, K, T, N extends ObjectFunction> extends ComplexSqlQueryObjectAliasOmit<W, K, T, N> {
  debug: true;
}

export interface ComplexQueryObjectAliasOmitDebug<W, K, T, N extends ObjectFunction> extends ComplexQueryObjectAliasOmit<W, K, T, N> {
  debug: true;
}

export interface ComplexQueryObjectInclude<W, K, T, U extends ObjectFunction> extends Keywords<keyof T | ExtractKeys<U> | Array<keyof T | ExtractKeys<U>>> {
  where?: W | Partial<IncludeWhere<U>>;
  select: (keyof T)[] | K[];
  include: U;
  alias?: undefined;
}

export interface ComplexSqlQueryObjectIncludeParamsUnsafe<P, U, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectInclude<W, K, T, R> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryObjectIncludeParams<P, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectInclude<W, K, T, R> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectIncludeUnsafe<U, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectInclude<W, K, T, R> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryObjectInclude<W, K, T, R extends ObjectFunction> extends ComplexQueryObjectInclude<W, K, T, R> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectIncludeParamsUnsafeDebug<P, U, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeParamsUnsafe<P, U, W, K, T, R> {
  debug: true;
}

export interface ComplexSqlQueryObjectIncludeParamsDebug<P, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeParams<P, W, K, T, R> {
  debug: true;
}

export interface ComplexSqlQueryObjectIncludeUnsafeDebug<U, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeUnsafe<U, W, K, T, R> {
  debug: true;
}

export interface ComplexSqlQueryObjectIncludeDebug<W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectInclude<W, K, T, R> {
  debug: true;
}

export interface ComplexQueryObjectIncludeDebug<W, K, T, U extends ObjectFunction> extends ComplexQueryObjectInclude<W, K, T, U> {
  debug: true;
}

export interface ComplexQueryObjectIncludeOmit<W, K, T, U extends ObjectFunction> extends Keywords<keyof T | ExtractKeys<U> | Array<keyof T | ExtractKeys<U>>> {
  where?: W | Partial<IncludeWhere<U>>;
  select?: undefined;
  omit: (keyof T)[] | K[] | K;
  include: U;
  alias?: undefined;
}

export interface ComplexSqlQueryObjectIncludeOmitParamsUnsafe<P, U, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectIncludeOmit<W, K, T, R> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryObjectIncludeOmitParams<P, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectIncludeOmit<W, K, T, R> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectIncludeOmitUnsafe<U, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectIncludeOmit<W, K, T, R> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryObjectIncludeOmit<W, K, T, R extends ObjectFunction> extends ComplexQueryObjectIncludeOmit<W, K, T, R> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectIncludeOmitParamsUnsafeDebug<P, U, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeOmitParamsUnsafe<P, U, W, K, T, R> {
  debug: true;
}

export interface ComplexSqlQueryObjectIncludeOmitParamsDebug<P, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeOmitParams<P, W, K, T, R> {
  debug: true;
}

export interface ComplexSqlQueryObjectIncludeOmitUnsafeDebug<U, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeOmitUnsafe<U, W, K, T, R> {
  debug: true;
}

export interface ComplexSqlQueryObjectIncludeOmitDebug<W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeOmit<W, K, T, R> {
  debug: true;
}

export interface ComplexQueryObjectIncludeOmitDebug<W, K, T, U extends ObjectFunction> extends ComplexQueryObjectIncludeOmit<W, K, T, U> {
  debug: true;
}

export interface ComplexQueryObjectIncludeAlias<W, K, T, U extends ObjectFunction, N extends ObjectFunction> extends Keywords<keyof T | ExtractKeys<U & N> | Array<keyof T | ExtractKeys<U & N>>> {
  where?: W | Partial<IncludeWhere<U>> | Partial<TransformAlias<N>>;
  select: (keyof T)[] | K[];
  include: U;
  alias: N;
}

export interface ComplexSqlQueryObjectIncludeAliasParamsUnsafe<P, U, W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryObjectIncludeAlias<W, K, T, R, N> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryObjectIncludeAliasParams<P, W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryObjectIncludeAlias<W, K, T, R, N> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectIncludeAliasUnsafe<U, W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryObjectIncludeAlias<W, K, T, R, N> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryObjectIncludeAlias<W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryObjectIncludeAlias<W, K, T, R, N> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectIncludeAliasParamsUnsafeDebug<P, U, W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexSqlQueryObjectIncludeAliasParamsUnsafe<P, U, W, K, T, R, N> {
  debug: true;
}

export interface ComplexSqlQueryObjectIncludeAliasParamsDebug<P, W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexSqlQueryObjectIncludeAliasParams<P, W, K, T, R, N> {
  debug: true;
}

export interface ComplexSqlQueryObjectIncludeAliasUnsafeDebug<U, W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexSqlQueryObjectIncludeAliasUnsafe<U, W, K, T, R, N> {
  debug: true;
}

export interface ComplexSqlQueryObjectIncludeAliasDebug<W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexSqlQueryObjectIncludeAlias<W, K, T, R, N> {
  debug: true;
}

export interface ComplexQueryObjectIncludeAliasDebug<W, K, T, U extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryObjectIncludeAlias<W, K, T, U, N> {
  debug: true;
}

export interface ComplexQueryObjectIncludeAliasOmit<W, K, T, U extends ObjectFunction, N extends ObjectFunction> extends Keywords<keyof T | ExtractKeys<U & N> | Array<keyof T | ExtractKeys<U & N>>> {
  where?: W | Partial<IncludeWhere<U>> | Partial<TransformAlias<N>>;
  select?: undefined;
  omit: (keyof T)[] | K[] | K;
  include: U;
  alias: N;
}

export interface ComplexSqlQueryObjectIncludeAliasOmitParamsUnsafe<P, U, W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryObjectIncludeAliasOmit<W, K, T, R, N> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryObjectIncludeAliasOmitParams<P, W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryObjectIncludeAliasOmit<W, K, T, R, N> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectIncludeAliasOmitUnsafe<U, W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryObjectIncludeAliasOmit<W, K, T, R, N> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryObjectIncludeAliasOmit<W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryObjectIncludeAliasOmit<W, K, T, R, N> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryObjectIncludeAliasOmitParamsUnsafeDebug<P, U, W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexSqlQueryObjectIncludeAliasOmitParamsUnsafe<P, U, W, K, T, R, N> {
  debug: true;
}

export interface ComplexSqlQueryObjectIncludeAliasOmitParamsDebug<P, W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexSqlQueryObjectIncludeAliasOmitParams<P, W, K, T, R, N> {
  debug: true;
}

export interface ComplexSqlQueryObjectIncludeAliasOmitUnsafeDebug<U, W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexSqlQueryObjectIncludeAliasOmitUnsafe<U, W, K, T, R, N> {
  debug: true;
}

export interface ComplexSqlQueryObjectIncludeAliasOmitDebug<W, K, T, R extends ObjectFunction, N extends ObjectFunction> extends ComplexSqlQueryObjectIncludeAliasOmit<W, K, T, R, N> {
  debug: true;
}

export interface ComplexQueryObjectIncludeAliasOmitDebug<W, K, T, U extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryObjectIncludeAliasOmit<W, K, T, U, N> {
  debug: true;
}

export interface ComplexQueryValue<W, K, T> extends Keywords<Array<keyof T> | keyof T> {
  where?: W;
  select: K;
  omit?: undefined;
  include?: undefined;
  alias?: undefined;
}

export interface ComplexSqlQueryValueParamsUnsafe<P, U, W, K, T> extends ComplexQueryValue<W, K, T> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQueryValueParams<P, W, K, T> extends ComplexQueryValue<W, K, T> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQueryValueUnsafe<U, W, K, T> extends ComplexQueryValue<W, K, T> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQueryValue<W, K, T> extends ComplexQueryValue<W, K, T> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQueryValueParamsUnsafeDebug<P, U, W, K, T> extends ComplexSqlQueryValueParamsUnsafe<P, U, W, K, T> {
  debug: true;
}

export interface ComplexSqlQueryValueParamsDebug<P, W, K, T> extends ComplexSqlQueryValueParams<P, W, K, T> {
  debug: true;
}

export interface ComplexSqlQueryValueUnsafeDebug<U, W, K, T> extends ComplexSqlQueryValueUnsafe<U, W, K, T> {
  debug: true;
}

export interface ComplexSqlQueryValueDebug<W, K, T> extends ComplexSqlQueryValue<W, K, T> {
  debug: true;
}

export interface ComplexQueryValueDebug<W, K, T> extends ComplexQueryValue<W, K, T> {
  debug: true;
}

export interface ComplexQuerySelector<W, T, N> extends Keywords<Array<keyof T> | keyof T> {
  where?: W;
  select: (selector: T) => N;
}

export interface ComplexSqlQuerySelectorParamsUnsafe<P, U, W, T, N> extends ComplexQuerySelector<W, T, N> {
  params: P;
  unsafe: U;
}

export interface ComplexSqlQuerySelectorParams<P, W, T, N> extends ComplexQuerySelector<W, T, N> {
  params: P;
  unsafe?: undefined;
}

export interface ComplexSqlQuerySelectorUnsafe<U, W, T, N> extends ComplexQuerySelector<W, T, N> {
  params?: undefined;
  unsafe: U;
}

export interface ComplexSqlQuerySelector<W, T, N> extends ComplexQuerySelector<W, T, N> {
  params?: undefined;
  unsafe?: undefined;
}

export interface ComplexSqlQuerySelectorParamsUnsafeDebug<P, U, W, T, N> extends ComplexSqlQuerySelectorParamsUnsafe<P, U, W, T, N> {
  debug: true;
}

export interface ComplexSqlQuerySelectorParamsDebug<P, W, T, N> extends ComplexSqlQuerySelectorParams<P, W, T, N> {
  debug: true;
}

export interface ComplexSqlQuerySelectorUnsafeDebug<U, W, T, N> extends ComplexSqlQuerySelectorUnsafe<U, W, T, N> {
  debug: true;
}

export interface ComplexSqlQuerySelectorDebug<W, T, N> extends ComplexSqlQuerySelector<W, T, N> {
  debug: true;
}

export interface ComplexQuerySelectorDebug<W, T, N> extends ComplexQuerySelector<W, T, N> {
  debug: true;
}

type MakeOptionalNullable<T> = {
  [K in keyof T]: undefined extends T[K] ? T[K] | null : T[K];
};

export interface UpdateQuery<W, T> {
  where?: W | null;
  set: Partial<MakeOptionalNullable<T>>;
}

export interface UpsertQuery<T, K> {
  values: T;
  target?: K;
  set?: Partial<MakeOptionalNullable<T>>;
}

export interface DefineWhere<W> {
  where: (query: W) => void;
}

export interface DefineProperties<T, C> {
  [key: string]: (table: T, columns: C) => void;
}

export interface DefineQuery<T, C> {
  define: (properties: DefineProperties<T, C> | ((table: T, columns: C) => void)) => void;
}

export interface DebugQuery {
  sql: string;
  params?: any;
}

export interface DebugResult<R> {
  result: R;
  queries: Array<DebugQuery>;
}

export interface VirtualQueries<T, W> {
  [key: string]: any;
  get(params?: W | null): Promise<T | undefined>;
  get<K extends keyof T>(params: W | null, columns: Array<keyof T>): Promise<Pick<T, K> | undefined>;
  get<K extends keyof T>(params: W | null, column: K): Promise<T[K] | undefined>;
  get<N>(params: W | null, column: (selector: T) => N): Promise<N | undefined>;
  get(query: HighlightQuery<W, T>): Promise<{ id: number, highlight: string } | undefined>;
  get(query: SnippetQuery<W, T>): Promise<{ id: number, snippet: string } | undefined>;
  many(params?: W | null): Promise<Array<T>>;
  many<K extends keyof T>(params: W | null, columns: Array<keyof T>): Promise<Array<Pick<T, K>>>;
  many<K extends keyof T>(params: W | null, column: K): Promise<Array<T[K]>>;
  many<N>(params: W | null, column: (selector: TableObject<T>) => N): Promise<Array<N>>;
  query<K extends keyof T>(query: VirtualQueryObject<W, K, T>): Promise<Array<Pick<T, K>>>;
  query<K extends keyof T>(query: VirtualQueryValue<W, K, T>): Promise<Array<T[K]>>;
  query(query: VirtualQuery<W, T>): Promise<Array<T>>; 
  query<N>(query: VirtualQuerySelector<W, T, N>): Promise<Array<N>>;
  query(query: HighlightQuery<W, T>): Promise<Array<{ id: number, highlight: string }>>;
  query(query: SnippetQuery<W, T>): Promise<Array<{ id: number, snippet: string }>>;
}

export interface Queries<T, I, W, R, Y> {
  [key: string]: any;
  insert(params: I): Promise<R>;
  insertMany(params: Array<I>): Promise<void>;
  update(options: UpdateQuery<W, I>): Promise<number>;
  upsert<K extends keyof T>(options: UpsertQuery<I, K>): Promise<R>;
  get(params?: W | null): Promise<T | undefined>;
  get<K extends keyof T>(params: W | null, column: K): Promise<T[K] | undefined>;
  get<K extends keyof T>(params: W | null, columns: (keyof T)[] | K[]): Promise<Pick<T, K> | undefined>;
  get<N>(params: W | null, column: (selector: T) => N): Promise<N | undefined>;
  many(params?: W): Promise<Array<T>>;
  many<K extends keyof T>(params: W | null, columns: (keyof T)[] | K[]): Promise<Array<Pick<T, K>>>;
  many<K extends keyof T>(params: W | null, column: K): Promise<Array<T[K]>>;
  many<N>(params: W | null, column: (selector: T) => N): Promise<Array<N>>;
  query<K extends keyof T>(query: ComplexQueryObject<W, K, T>): Promise<Array<Pick<T, K>>>;
  query<K extends keyof T>(query: ComplexQueryObjectDebug<W, K, T>): Promise<DebugResult<Array<Pick<T, K>>>>;
  query<K extends keyof T>(query: ComplexQueryObjectOmit<W, K, T>): Promise<Array<Omit<T, K>>>;
  query<K extends keyof T>(query: ComplexQueryObjectOmitDebug<W, K, T>): Promise<DebugResult<Array<Omit<T, K>>>>;
  query<K extends keyof T, N extends Alias<T>>(query: ComplexQueryObjectAlias<W, K, T, N>): Promise<Array<Pick<T, K> & ReturnTypes<N>>>;
  query<K extends keyof T, N extends Alias<T>>(query: ComplexQueryObjectAliasDebug<W, K, T, N>): Promise<DebugResult<Array<Pick<T, K> & ReturnTypes<N>>>>;
  query<K extends keyof T, N extends Alias<T>>(query: ComplexQueryObjectAliasOmit<W, K, T, N>): Promise<Array<Omit<T, K> & ReturnTypes<N>>>;
  query<K extends keyof T, N extends Alias<T>>(query: ComplexQueryObjectAliasOmitDebug<W, K, T, N>): Promise<DebugResult<Array<Omit<T, K> & ReturnTypes<N>>>>;
  query<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectInclude<W, K, T, U>): Promise<Array<MergeIncludes<Pick<T, K>, U>>>;
  query<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeDebug<W, K, T, U>): Promise<DebugResult<Array<MergeIncludes<Pick<T, K>, U>>>>;
  query<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmit<W, K, T, U>): Promise<Array<MergeIncludes<Omit<T, K>, U>>>;
  query<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmitDebug<W, K, T, U>): Promise<DebugResult<Array<MergeIncludes<Omit<T, K>, U>>>>;
  query<K extends keyof T, U extends Includes<Y, T>, N extends Alias<T>>(query: ComplexQueryObjectIncludeAlias<W, K, T, U, N>): Promise<Array<MergeIncludes<Pick<T, K>, U> & ReturnTypes<N>>>;
  query<K extends keyof T, U extends Includes<Y, T>, N extends Alias<T>>(query: ComplexQueryObjectIncludeAliasDebug<W, K, T, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<T, K>, U> & ReturnTypes<N>>>>;
  query<K extends keyof T, U extends Includes<Y, T>, N extends Alias<T>>(query: ComplexQueryObjectIncludeAliasOmit<W, K, T, U, N>): Promise<Array<MergeIncludes<Omit<T, K>, U> & ReturnTypes<N>>>;
  query<K extends keyof T, U extends Includes<Y, T>, N extends Alias<T>>(query: ComplexQueryObjectIncludeAliasOmitDebug<W, K, T, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<T, K>, U> & ReturnTypes<N>>>>;
  query<K extends keyof T>(query: ComplexQueryValue<W, K, T>): Promise<Array<T[K]>>;
  query<K extends keyof T>(query: ComplexQueryValueDebug<W, K, T>): Promise<DebugResult<Array<T[K]>>>;
  query(query: ComplexQuery<W, T>): Promise<Array<T>>;
  query(query: ComplexQueryDebug<W, T>): Promise<DebugResult<Array<T>>>;
  query<U extends Includes<Y, T>>(query: ComplexQueryInclude<W, T, U>): Promise<Array<MergeIncludes<T, U>>>;
  query<U extends Includes<Y, T>>(query: ComplexQueryIncludeDebug<W, T, U>): Promise<DebugResult<Array<MergeIncludes<T, U>>>>;
  query<U extends Includes<Y, T>, N extends Alias<T>>(query: ComplexQueryIncludeAlias<W, T, U, N>): Promise<Array<MergeIncludes<T, U> & ReturnTypes<N>>>;
  query<U extends Includes<Y, T>, N extends Alias<T>>(query: ComplexQueryIncludeAliasDebug<W, T, U, N>): Promise<DebugResult<Array<MergeIncludes<T, U> & ReturnTypes<N>>>>;
  query<N extends Alias<T>>(query: ComplexQueryAlias<W, T, N>): Promise<Array<T & ReturnTypes<N>>>;
  query<N extends Alias<T>>(query: ComplexQueryAliasDebug<W, T, N>): Promise<DebugResult<Array<T & ReturnTypes<N>>>>;
  query<N>(query: ComplexQuerySelector<W, T, N>): Promise<Array<N>>;
  query<N>(query: ComplexQuerySelectorDebug<W, T, N>): Promise<DebugResult<Array<N>>>;
  first<K extends keyof T>(query: ComplexQueryObject<W, K, T>): Promise<Pick<T, K> | undefined>;
  first<K extends keyof T>(query: ComplexQueryObjectDebug<W, K, T>): Promise<DebugResult<Pick<T, K> | undefined>>;
  first<K extends keyof T>(query: ComplexQueryObjectOmit<W, K, T>): Promise<Omit<T, K> | undefined>;
  first<K extends keyof T>(query: ComplexQueryObjectOmitDebug<W, K, T>): Promise<DebugResult<Omit<T, K> | undefined>>;
  first<K extends keyof T, N extends Alias<T>>(query: ComplexQueryObjectAlias<W, K, T, N>): Promise<(Pick<T, K> & ReturnTypes<N>) | undefined>;
  first<K extends keyof T, N extends Alias<T>>(query: ComplexQueryObjectAliasDebug<W, K, T, N>): Promise<DebugResult<(Pick<T, K> & ReturnTypes<N>) | undefined>>;
  first<K extends keyof T, N extends Alias<T>>(query: ComplexQueryObjectAliasOmit<W, K, T, N>): Promise<(Omit<T, K> & ReturnTypes<N>) | undefined>;
  first<K extends keyof T, N extends Alias<T>>(query: ComplexQueryObjectAliasOmitDebug<W, K, T, N>): Promise<DebugResult<(Omit<T, K> & ReturnTypes<N>) | undefined>>;
  first<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectInclude<W, K, T, U>): Promise<MergeIncludes<Pick<T, K>, U> | undefined>;
  first<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeDebug<W, K, T, U>): Promise<DebugResult<MergeIncludes<Pick<T, K>, U> | undefined>>;
  first<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmit<W, K, T, U>): Promise<MergeIncludes<Omit<T, K>, U> | undefined>;
  first<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmitDebug<W, K, T, U>): Promise<DebugResult<MergeIncludes<Omit<T, K>, U> | undefined>>;
  first<K extends keyof T, U extends Includes<Y, T>, N extends Alias<T>>(query: ComplexQueryObjectIncludeAlias<W, K, T, U, N>): Promise<(MergeIncludes<Pick<T, K>, U> & ReturnTypes<N>) | undefined>;
  first<K extends keyof T, U extends Includes<Y, T>, N extends Alias<T>>(query: ComplexQueryObjectIncludeAliasDebug<W, K, T, U, N>): Promise<DebugResult<(MergeIncludes<Pick<T, K>, U> & ReturnTypes<N>) | undefined>>;
  first<K extends keyof T, U extends Includes<Y, T>, N extends Alias<T>>(query: ComplexQueryObjectIncludeAliasOmit<W, K, T, U, N>): Promise<(MergeIncludes<Omit<T, K>, U> & ReturnTypes<N>) | undefined>;
  first<K extends keyof T, U extends Includes<Y, T>, N extends Alias<T>>(query: ComplexQueryObjectIncludeAliasOmitDebug<W, K, T, U, N>): Promise<DebugResult<(MergeIncludes<Omit<T, K>, U> & ReturnTypes<N>) | undefined>>;
  first<K extends keyof T>(query: ComplexQueryValue<W, K, T>): Promise<T[K] | undefined>;
  first<K extends keyof T>(query: ComplexQueryValueDebug<W, K, T>): Promise<DebugResult<T[K] | undefined>>;
  first(query: ComplexQuery<W, T>): Promise<T | undefined>;
  first(query: ComplexQueryDebug<W, T>): Promise<DebugResult<T | undefined>>;
  first<N extends Alias<T>>(query: ComplexQueryAlias<W, T, N>): Promise<(T & ReturnTypes<N>) | undefined>;
  first<N extends Alias<T>>(query: ComplexQueryAliasDebug<W, T, N>): Promise<DebugResult<(T & ReturnTypes<N>) | undefined>>;
  first<U extends Includes<Y, T>>(query: ComplexQueryInclude<W, T, U>): Promise<MergeIncludes<T, U> | undefined>;
  first<U extends Includes<Y, T>>(query: ComplexQueryIncludeDebug<W, T, U>): Promise<DebugResult<MergeIncludes<T, U> | undefined>>;
  first<U extends Includes<Y, T>, N extends Alias<T>>(query: ComplexQueryIncludeAlias<W, T, U, N>): Promise<(MergeIncludes<T, U> & ReturnTypes<N>) | undefined>;
  first<U extends Includes<Y, T>, N extends Alias<T>>(query: ComplexQueryIncludeAliasDebug<W, T, U, N>): Promise<DebugResult<(MergeIncludes<T, U> & ReturnTypes<N>) | undefined>>;
  first<N>(query: ComplexQuerySelector<W, T, N>): Promise<N | undefined>;
  first<N>(query: ComplexQuerySelectorDebug<W, T, N>): Promise<DebugResult<N | undefined>>;
  count<K extends keyof T>(query?: AggregateQuery<W, K>): Promise<number>;
  count<K extends keyof T>(query?: AggregateQueryDebug<W, K>): Promise<DebugResult<number>>;
  avg<K extends keyof T>(query: AggregateQuery<W, K>): Promise<number>;
  avg<K extends keyof T>(query: AggregateQueryDebug<W, K>): Promise<DebugResult<number>>;
  max<K extends keyof T>(query: AggregateQuery<W, K>): Promise<number>;
  max<K extends keyof T>(query: AggregateQueryDebug<W, K>): Promise<DebugResult<number>>;
  min<K extends keyof T>(query: AggregateQuery<W, K>): Promise<number>;
  min<K extends keyof T>(query: AggregateQueryDebug<W, K>): Promise<DebugResult<number>>;
  sum<K extends keyof T>(query: AggregateQuery<W, K>): Promise<number>;
  sum<K extends keyof T>(query: AggregateQueryDebug<W, K>): Promise<DebugResult<number>>;
  exists(params: W | null): Promise<boolean>;
  group<K extends keyof T, B extends K | (keyof T)[] | K[]>(params: GroupQueryObject<W, B>): Promise<Array<Pick<T, B extends any[] ? B[number] : B> & GroupResult<T>>>;
  group<K extends keyof T, B extends K | (keyof T)[] | K[]>(params: GroupQueryObjectDebug<W, B>): Promise<DebugResult<Array<Pick<T, B extends any[] ? B[number] : B> & GroupResult<T>>>>;
  group<K extends keyof T, U extends GroupAlias<T>>(params: GroupQueryAlias<W, T, K, U>): Promise<Array<Pick<T, K> & ReturnTypes<U>>>;
  group<K extends keyof T, U extends GroupAlias<T>>(params: GroupQueryAliasDebug<W, T, K, U>): Promise<DebugResult<Array<Pick<T, K> & ReturnTypes<U>>>>;
  remove(params?: W): Promise<number>;
}

interface Range<T> {
	gt?: T;
	gte?: T;
	lt?: T;
	lte?: T;
}

type CompareMethods<T> = {
  not: (value: T) => void;
	gt: (value: T) => void;
	lt: (value: T) => void;
	lte: (value: T) => void;
	like: (pattern: string) => void;
	match: (pattern: string) => void;
	glob: (pattern: string) => void;
	range: (limits: Range<T>) => void;
	eq: (value: T) => void;
}

type BooleanMethods<T> = {
  not: (value: T) => void;
  eq: (value: T) => void;
}

type ArrayMethods<T> = {
  includes: (value: T) => void;
  some: (selector: (value: ArrayTransform<T>) => void) => void;
}

type ArrayTransform<T> = T extends string | number | Date
  ? CompareMethods<T>
  : T extends boolean
  ? BooleanMethods<T>
  : T extends Array<infer U>
  ? ArrayMethods<U>
  : {
  [K in keyof T]: T[K] extends string | number | undefined
    ? CompareMethods<T[K]>
    : T[K] extends boolean | undefined
    ? BooleanMethods<T[K]>
    : T[K] extends Array<infer U>
    ? ArrayMethods<U>
    : T[K];
};

type Transform<T> = T extends string | number | Date
  ? CompareMethods<T>
  : T extends boolean
  ? BooleanMethods<T>
  : T extends Array<infer U>
  ? ArrayMethods<U>
  : {
  [K in keyof T]: T[K] extends string | number | undefined
    ? CompareMethods<T[K]>
    : T[K] extends boolean | undefined
    ? BooleanMethods<T[K]>
    : T[K] extends Array<infer U>
    ? ArrayMethods<U>
    : T[K];
};

type WhereFunction<T> = (builder: Transform<T>) => void;

type JsonValue = string | number | boolean | null;

type JsonArray = Array<Json>;

type JsonObject = {
  [key: string]: Json;
}

type JsonMap<T> = {
  [key: string]: T;
}

type Json = JsonValue | JsonObject | JsonArray;

type TableProperty = {
  [key: string]: TableProperty;
}

type TableObject<T> = {
  [key in keyof T]: TableProperty;
}

export interface SqlQueryParamsUnsafe<P, U> {
  params: P;
  unsafe: U;
}

export interface SqlQueryParams<P> {
  params: P;
  unsafe?: undefined;
}

export interface SqlQueryUnsafe<U> {
  params?: undefined;
  unsafe: U;
}

type WhereField<T> = NonNullable<T> | Array<NonNullable<T>> | WhereFunction<NonNullable<T>>;

type MaybeNullWhereField<T> = 
  T extends null ? null :
  null extends T ? WhereField<T> | null :
  WhereField<T>;

export type ToWhere<T> = {
  [K in keyof T]?: MaybeNullWhereField<T[K]>;
} & {
  and?: Array<ToWhere<T>>;
  or?: Array<ToWhere<T>>;
};


export interface WeightClass {
  id: number;
  name: string;
  weightLbs: number;
  gender: string;
}

export interface InsertWeightClass {
  id?: number;
  name: string;
  weightLbs: number;
  gender: string;
}

export interface WhereWeightClass {
  id?: number | Array<number> | WhereFunction<number>;
  name?: string | Array<string> | WhereFunction<string>;
  weightLbs?: number | Array<number> | WhereFunction<number>;
  gender?: string | Array<string> | WhereFunction<string>;
  and?: Array<WhereWeightClass>;
  or?: Array<WhereWeightClass>;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  lat: number;
  long: number;
}

export interface InsertLocation {
  id?: number;
  name: string;
  address: string;
  lat: number;
  long: number;
}

export interface WhereLocation {
  id?: number | Array<number> | WhereFunction<number>;
  name?: string | Array<string> | WhereFunction<string>;
  address?: string | Array<string> | WhereFunction<string>;
  lat?: number | Array<number> | WhereFunction<number>;
  long?: number | Array<number> | WhereFunction<number>;
  and?: Array<WhereLocation>;
  or?: Array<WhereLocation>;
}

export interface LocationById {
  id: number;
  name: string;
  address: string;
  lat: number;
  long: number;
}

export interface LocationByMethod {
  id: number;
  name: string;
  count: number;
}

export interface LocationDetailedEvents {
  name: string;
  events: Array<{ id: number, name: string }>;
}

export interface LocationEvents {
  name: string;
  events: Array<string>;
}

export interface LocationWinners {
  location: string;
  fighter: string;
  wins: number;
}

export interface LocationByIdParams {
  id: any;
}

export interface LocationByMethodParams {
  id: any;
}

export interface LocationQueries {
  byId<N extends Alias<LocationById>>(query: ComplexSqlQueryAliasParams<LocationByIdParams, ToWhere<LocationById>, LocationById, N>): Promise<Array<LocationById & ReturnTypes<N>>>;
  byId<N extends Alias<LocationById>>(query: ComplexSqlQueryAliasParamsDebug<LocationByIdParams, ToWhere<LocationById>, LocationById, N>): Promise<DebugResult<Array<LocationById & ReturnTypes<N>>>>;
  byId<U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryIncludeParams<LocationByIdParams, ToWhere<LocationById>, LocationById, U>): Promise<Array<MergeIncludes<LocationById, U>>>;
  byId<U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryIncludeParamsDebug<LocationByIdParams, ToWhere<LocationById>, LocationById, U>): Promise<DebugResult<Array<MergeIncludes<LocationById, U>>>>;
  byId<U extends Includes<TypedDb, LocationById>, N extends Alias<LocationById>>(query: ComplexSqlQueryIncludeAliasParams<LocationByIdParams, ToWhere<LocationById>, LocationById, U, N>): Promise<Array<MergeIncludes<LocationById, U> & ReturnTypes<N>>>;
  byId<U extends Includes<TypedDb, LocationById>, N extends Alias<LocationById>>(query: ComplexSqlQueryIncludeAliasParamsDebug<LocationByIdParams, ToWhere<LocationById>, LocationById, U, N>): Promise<DebugResult<Array<MergeIncludes<LocationById, U> & ReturnTypes<N>>>>;
  byId<K extends keyof LocationById, N extends Alias<LocationById>>(query: ComplexSqlQueryObjectAliasParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById, N>): Promise<Array<Pick<LocationById, K> & ReturnTypes<N>>>;
  byId<K extends keyof LocationById, N extends Alias<LocationById>>(query: ComplexSqlQueryObjectAliasParamsDebug<LocationByIdParams, ToWhere<LocationById>, K, LocationById, N>): Promise<DebugResult<Array<Pick<LocationById, K> & ReturnTypes<N>>>>;
  byId<K extends keyof LocationById>(query: ComplexSqlQueryObjectParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById>): Promise<Array<Pick<LocationById, K>>>;
  byId<K extends keyof LocationById>(query: ComplexSqlQueryObjectParamsDebug<LocationByIdParams, ToWhere<LocationById>, K, LocationById>): Promise<DebugResult<Array<Pick<LocationById, K>>>>;
  byId<K extends keyof LocationById>(query: ComplexSqlQueryObjectOmitParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById>): Promise<Array<Omit<LocationById, K>>>;
  byId<K extends keyof LocationById>(query: ComplexSqlQueryObjectOmitParamsDebug<LocationByIdParams, ToWhere<LocationById>, K, LocationById>): Promise<DebugResult<Array<Omit<LocationById, K>>>>;
  byId<K extends keyof LocationById, N extends Alias<LocationById>>(query: ComplexSqlQueryObjectAliasOmitParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById, N>): Promise<Array<Omit<LocationById, K> & ReturnTypes<N>>>;
  byId<K extends keyof LocationById, N extends Alias<LocationById>>(query: ComplexSqlQueryObjectAliasOmitParamsDebug<LocationByIdParams, ToWhere<LocationById>, K, LocationById, N>): Promise<DebugResult<Array<Omit<LocationById, K> & ReturnTypes<N>>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryObjectIncludeParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U>): Promise<Array<MergeIncludes<Pick<LocationById, K>, U>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryObjectIncludeParamsDebug<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationById, K>, U>>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryObjectIncludeOmitParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U>): Promise<Array<MergeIncludes<Omit<LocationById, K>, U>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationById, K>, U>>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>, N extends Alias<LocationById>>(query: ComplexSqlQueryObjectIncludeAliasParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U, N>): Promise<Array<MergeIncludes<Pick<LocationById, K>, U> & ReturnTypes<N>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>, N extends Alias<LocationById>>(query: ComplexSqlQueryObjectIncludeAliasParamsDebug<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationById, K>, U> & ReturnTypes<N>>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>, N extends Alias<LocationById>>(query: ComplexSqlQueryObjectIncludeAliasOmitParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U, N>): Promise<Array<MergeIncludes<Omit<LocationById, K>, U> & ReturnTypes<N>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>, N extends Alias<LocationById>>(query: ComplexSqlQueryObjectIncludeAliasOmitParamsDebug<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationById, K>, U> & ReturnTypes<N>>>>;
  byId<K extends keyof LocationById>(query: ComplexSqlQueryValueParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById>): Promise<Array<LocationById[K]>>;
  byId<K extends keyof LocationById>(query: ComplexSqlQueryValueParamsDebug<LocationByIdParams, ToWhere<LocationById>, K, LocationById>): Promise<DebugResult<Array<LocationById[K]>>>;
  byId(query: ComplexSqlQueryParams<LocationByIdParams, ToWhere<LocationById>, LocationById>): Promise<Array<LocationById>>;
  byId(query: ComplexSqlQueryParamsDebug<LocationByIdParams, ToWhere<LocationById>, LocationById>): Promise<DebugResult<Array<LocationById>>>;
  byId<N>(query: ComplexSqlQuerySelectorParams<LocationByIdParams, ToWhere<LocationById>, LocationById, N>): Promise<Array<N>>;
  byId<N>(query: ComplexSqlQuerySelectorParamsDebug<LocationByIdParams, ToWhere<LocationById>, LocationById, N>): Promise<DebugResult<Array<N>>>;
  byMethod<N extends Alias<LocationByMethod>>(query: ComplexSqlQueryAliasParams<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, N>): Promise<Array<LocationByMethod & ReturnTypes<N>>>;
  byMethod<N extends Alias<LocationByMethod>>(query: ComplexSqlQueryAliasParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, N>): Promise<DebugResult<Array<LocationByMethod & ReturnTypes<N>>>>;
  byMethod<U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryIncludeParams<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, U>): Promise<Array<MergeIncludes<LocationByMethod, U>>>;
  byMethod<U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryIncludeParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, U>): Promise<DebugResult<Array<MergeIncludes<LocationByMethod, U>>>>;
  byMethod<U extends Includes<TypedDb, LocationByMethod>, N extends Alias<LocationByMethod>>(query: ComplexSqlQueryIncludeAliasParams<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, U, N>): Promise<Array<MergeIncludes<LocationByMethod, U> & ReturnTypes<N>>>;
  byMethod<U extends Includes<TypedDb, LocationByMethod>, N extends Alias<LocationByMethod>>(query: ComplexSqlQueryIncludeAliasParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, U, N>): Promise<DebugResult<Array<MergeIncludes<LocationByMethod, U> & ReturnTypes<N>>>>;
  byMethod<K extends keyof LocationByMethod, N extends Alias<LocationByMethod>>(query: ComplexSqlQueryObjectAliasParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, N>): Promise<Array<Pick<LocationByMethod, K> & ReturnTypes<N>>>;
  byMethod<K extends keyof LocationByMethod, N extends Alias<LocationByMethod>>(query: ComplexSqlQueryObjectAliasParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, N>): Promise<DebugResult<Array<Pick<LocationByMethod, K> & ReturnTypes<N>>>>;
  byMethod<K extends keyof LocationByMethod>(query: ComplexSqlQueryObjectParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod>): Promise<Array<Pick<LocationByMethod, K>>>;
  byMethod<K extends keyof LocationByMethod>(query: ComplexSqlQueryObjectParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod>): Promise<DebugResult<Array<Pick<LocationByMethod, K>>>>;
  byMethod<K extends keyof LocationByMethod>(query: ComplexSqlQueryObjectOmitParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod>): Promise<Array<Omit<LocationByMethod, K>>>;
  byMethod<K extends keyof LocationByMethod>(query: ComplexSqlQueryObjectOmitParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod>): Promise<DebugResult<Array<Omit<LocationByMethod, K>>>>;
  byMethod<K extends keyof LocationByMethod, N extends Alias<LocationByMethod>>(query: ComplexSqlQueryObjectAliasOmitParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, N>): Promise<Array<Omit<LocationByMethod, K> & ReturnTypes<N>>>;
  byMethod<K extends keyof LocationByMethod, N extends Alias<LocationByMethod>>(query: ComplexSqlQueryObjectAliasOmitParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, N>): Promise<DebugResult<Array<Omit<LocationByMethod, K> & ReturnTypes<N>>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryObjectIncludeParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U>): Promise<Array<MergeIncludes<Pick<LocationByMethod, K>, U>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryObjectIncludeParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationByMethod, K>, U>>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryObjectIncludeOmitParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U>): Promise<Array<MergeIncludes<Omit<LocationByMethod, K>, U>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationByMethod, K>, U>>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>, N extends Alias<LocationByMethod>>(query: ComplexSqlQueryObjectIncludeAliasParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U, N>): Promise<Array<MergeIncludes<Pick<LocationByMethod, K>, U> & ReturnTypes<N>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>, N extends Alias<LocationByMethod>>(query: ComplexSqlQueryObjectIncludeAliasParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationByMethod, K>, U> & ReturnTypes<N>>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>, N extends Alias<LocationByMethod>>(query: ComplexSqlQueryObjectIncludeAliasOmitParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U, N>): Promise<Array<MergeIncludes<Omit<LocationByMethod, K>, U> & ReturnTypes<N>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>, N extends Alias<LocationByMethod>>(query: ComplexSqlQueryObjectIncludeAliasOmitParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationByMethod, K>, U> & ReturnTypes<N>>>>;
  byMethod<K extends keyof LocationByMethod>(query: ComplexSqlQueryValueParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod>): Promise<Array<LocationByMethod[K]>>;
  byMethod<K extends keyof LocationByMethod>(query: ComplexSqlQueryValueParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod>): Promise<DebugResult<Array<LocationByMethod[K]>>>;
  byMethod(query: ComplexSqlQueryParams<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod>): Promise<Array<LocationByMethod>>;
  byMethod(query: ComplexSqlQueryParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod>): Promise<DebugResult<Array<LocationByMethod>>>;
  byMethod<N>(query: ComplexSqlQuerySelectorParams<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, N>): Promise<Array<N>>;
  byMethod<N>(query: ComplexSqlQuerySelectorParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, N>): Promise<DebugResult<Array<N>>>;
  detailedEvents<N extends Alias<LocationDetailedEvents>>(query: ComplexSqlQueryAlias<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, N>): Promise<Array<LocationDetailedEvents & ReturnTypes<N>>>;
  detailedEvents<N extends Alias<LocationDetailedEvents>>(query: ComplexSqlQueryAliasDebug<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, N>): Promise<DebugResult<Array<LocationDetailedEvents & ReturnTypes<N>>>>;
  detailedEvents<U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryInclude<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, U>): Promise<Array<MergeIncludes<LocationDetailedEvents, U>>>;
  detailedEvents<U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryIncludeDebug<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, U>): Promise<DebugResult<Array<MergeIncludes<LocationDetailedEvents, U>>>>;
  detailedEvents<U extends Includes<TypedDb, LocationDetailedEvents>, N extends Alias<LocationDetailedEvents>>(query: ComplexSqlQueryIncludeAlias<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, U, N>): Promise<Array<MergeIncludes<LocationDetailedEvents, U> & ReturnTypes<N>>>;
  detailedEvents<U extends Includes<TypedDb, LocationDetailedEvents>, N extends Alias<LocationDetailedEvents>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, U, N>): Promise<DebugResult<Array<MergeIncludes<LocationDetailedEvents, U> & ReturnTypes<N>>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, N extends Alias<LocationDetailedEvents>>(query: ComplexSqlQueryObjectAlias<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, N>): Promise<Array<Pick<LocationDetailedEvents, K> & ReturnTypes<N>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, N extends Alias<LocationDetailedEvents>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, N>): Promise<DebugResult<Array<Pick<LocationDetailedEvents, K> & ReturnTypes<N>>>>;
  detailedEvents<K extends keyof LocationDetailedEvents>(query: ComplexSqlQueryObject<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents>): Promise<Array<Pick<LocationDetailedEvents, K>>>;
  detailedEvents<K extends keyof LocationDetailedEvents>(query: ComplexSqlQueryObjectDebug<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents>): Promise<DebugResult<Array<Pick<LocationDetailedEvents, K>>>>;
  detailedEvents<K extends keyof LocationDetailedEvents>(query: ComplexSqlQueryObjectOmit<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents>): Promise<Array<Omit<LocationDetailedEvents, K>>>;
  detailedEvents<K extends keyof LocationDetailedEvents>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents>): Promise<DebugResult<Array<Omit<LocationDetailedEvents, K>>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, N extends Alias<LocationDetailedEvents>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, N>): Promise<Array<Omit<LocationDetailedEvents, K> & ReturnTypes<N>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, N extends Alias<LocationDetailedEvents>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, N>): Promise<DebugResult<Array<Omit<LocationDetailedEvents, K> & ReturnTypes<N>>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryObjectInclude<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U>): Promise<Array<MergeIncludes<Pick<LocationDetailedEvents, K>, U>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationDetailedEvents, K>, U>>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U>): Promise<Array<MergeIncludes<Omit<LocationDetailedEvents, K>, U>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationDetailedEvents, K>, U>>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>, N extends Alias<LocationDetailedEvents>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U, N>): Promise<Array<MergeIncludes<Pick<LocationDetailedEvents, K>, U> & ReturnTypes<N>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>, N extends Alias<LocationDetailedEvents>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationDetailedEvents, K>, U> & ReturnTypes<N>>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>, N extends Alias<LocationDetailedEvents>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U, N>): Promise<Array<MergeIncludes<Omit<LocationDetailedEvents, K>, U> & ReturnTypes<N>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>, N extends Alias<LocationDetailedEvents>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationDetailedEvents, K>, U> & ReturnTypes<N>>>>;
  detailedEvents<K extends keyof LocationDetailedEvents>(query: ComplexSqlQueryValue<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents>): Promise<Array<LocationDetailedEvents[K]>>;
  detailedEvents<K extends keyof LocationDetailedEvents>(query: ComplexSqlQueryValueDebug<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents>): Promise<DebugResult<Array<LocationDetailedEvents[K]>>>;
  detailedEvents(query: ComplexSqlQuery<ToWhere<LocationDetailedEvents>, LocationDetailedEvents>): Promise<Array<LocationDetailedEvents>>;
  detailedEvents(query: ComplexSqlQueryDebug<ToWhere<LocationDetailedEvents>, LocationDetailedEvents>): Promise<DebugResult<Array<LocationDetailedEvents>>>;
  detailedEvents<N>(query: ComplexSqlQuerySelector<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, N>): Promise<Array<N>>;
  detailedEvents<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, N>): Promise<DebugResult<Array<N>>>;
  events<N extends Alias<LocationEvents>>(query: ComplexSqlQueryAlias<ToWhere<LocationEvents>, LocationEvents, N>): Promise<Array<LocationEvents & ReturnTypes<N>>>;
  events<N extends Alias<LocationEvents>>(query: ComplexSqlQueryAliasDebug<ToWhere<LocationEvents>, LocationEvents, N>): Promise<DebugResult<Array<LocationEvents & ReturnTypes<N>>>>;
  events<U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryInclude<ToWhere<LocationEvents>, LocationEvents, U>): Promise<Array<MergeIncludes<LocationEvents, U>>>;
  events<U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryIncludeDebug<ToWhere<LocationEvents>, LocationEvents, U>): Promise<DebugResult<Array<MergeIncludes<LocationEvents, U>>>>;
  events<U extends Includes<TypedDb, LocationEvents>, N extends Alias<LocationEvents>>(query: ComplexSqlQueryIncludeAlias<ToWhere<LocationEvents>, LocationEvents, U, N>): Promise<Array<MergeIncludes<LocationEvents, U> & ReturnTypes<N>>>;
  events<U extends Includes<TypedDb, LocationEvents>, N extends Alias<LocationEvents>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<LocationEvents>, LocationEvents, U, N>): Promise<DebugResult<Array<MergeIncludes<LocationEvents, U> & ReturnTypes<N>>>>;
  events<K extends keyof LocationEvents, N extends Alias<LocationEvents>>(query: ComplexSqlQueryObjectAlias<ToWhere<LocationEvents>, K, LocationEvents, N>): Promise<Array<Pick<LocationEvents, K> & ReturnTypes<N>>>;
  events<K extends keyof LocationEvents, N extends Alias<LocationEvents>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<LocationEvents>, K, LocationEvents, N>): Promise<DebugResult<Array<Pick<LocationEvents, K> & ReturnTypes<N>>>>;
  events<K extends keyof LocationEvents>(query: ComplexSqlQueryObject<ToWhere<LocationEvents>, K, LocationEvents>): Promise<Array<Pick<LocationEvents, K>>>;
  events<K extends keyof LocationEvents>(query: ComplexSqlQueryObjectDebug<ToWhere<LocationEvents>, K, LocationEvents>): Promise<DebugResult<Array<Pick<LocationEvents, K>>>>;
  events<K extends keyof LocationEvents>(query: ComplexSqlQueryObjectOmit<ToWhere<LocationEvents>, K, LocationEvents>): Promise<Array<Omit<LocationEvents, K>>>;
  events<K extends keyof LocationEvents>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<LocationEvents>, K, LocationEvents>): Promise<DebugResult<Array<Omit<LocationEvents, K>>>>;
  events<K extends keyof LocationEvents, N extends Alias<LocationEvents>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<LocationEvents>, K, LocationEvents, N>): Promise<Array<Omit<LocationEvents, K> & ReturnTypes<N>>>;
  events<K extends keyof LocationEvents, N extends Alias<LocationEvents>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<LocationEvents>, K, LocationEvents, N>): Promise<DebugResult<Array<Omit<LocationEvents, K> & ReturnTypes<N>>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryObjectInclude<ToWhere<LocationEvents>, K, LocationEvents, U>): Promise<Array<MergeIncludes<Pick<LocationEvents, K>, U>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<LocationEvents>, K, LocationEvents, U>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationEvents, K>, U>>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<LocationEvents>, K, LocationEvents, U>): Promise<Array<MergeIncludes<Omit<LocationEvents, K>, U>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<LocationEvents>, K, LocationEvents, U>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationEvents, K>, U>>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>, N extends Alias<LocationEvents>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<LocationEvents>, K, LocationEvents, U, N>): Promise<Array<MergeIncludes<Pick<LocationEvents, K>, U> & ReturnTypes<N>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>, N extends Alias<LocationEvents>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<LocationEvents>, K, LocationEvents, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationEvents, K>, U> & ReturnTypes<N>>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>, N extends Alias<LocationEvents>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<LocationEvents>, K, LocationEvents, U, N>): Promise<Array<MergeIncludes<Omit<LocationEvents, K>, U> & ReturnTypes<N>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>, N extends Alias<LocationEvents>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<LocationEvents>, K, LocationEvents, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationEvents, K>, U> & ReturnTypes<N>>>>;
  events<K extends keyof LocationEvents>(query: ComplexSqlQueryValue<ToWhere<LocationEvents>, K, LocationEvents>): Promise<Array<LocationEvents[K]>>;
  events<K extends keyof LocationEvents>(query: ComplexSqlQueryValueDebug<ToWhere<LocationEvents>, K, LocationEvents>): Promise<DebugResult<Array<LocationEvents[K]>>>;
  events(query: ComplexSqlQuery<ToWhere<LocationEvents>, LocationEvents>): Promise<Array<LocationEvents>>;
  events(query: ComplexSqlQueryDebug<ToWhere<LocationEvents>, LocationEvents>): Promise<DebugResult<Array<LocationEvents>>>;
  events<N>(query: ComplexSqlQuerySelector<ToWhere<LocationEvents>, LocationEvents, N>): Promise<Array<N>>;
  events<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<LocationEvents>, LocationEvents, N>): Promise<DebugResult<Array<N>>>;
  winners<N extends Alias<LocationWinners>>(query: ComplexSqlQueryAlias<ToWhere<LocationWinners>, LocationWinners, N>): Promise<Array<LocationWinners & ReturnTypes<N>>>;
  winners<N extends Alias<LocationWinners>>(query: ComplexSqlQueryAliasDebug<ToWhere<LocationWinners>, LocationWinners, N>): Promise<DebugResult<Array<LocationWinners & ReturnTypes<N>>>>;
  winners<U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryInclude<ToWhere<LocationWinners>, LocationWinners, U>): Promise<Array<MergeIncludes<LocationWinners, U>>>;
  winners<U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryIncludeDebug<ToWhere<LocationWinners>, LocationWinners, U>): Promise<DebugResult<Array<MergeIncludes<LocationWinners, U>>>>;
  winners<U extends Includes<TypedDb, LocationWinners>, N extends Alias<LocationWinners>>(query: ComplexSqlQueryIncludeAlias<ToWhere<LocationWinners>, LocationWinners, U, N>): Promise<Array<MergeIncludes<LocationWinners, U> & ReturnTypes<N>>>;
  winners<U extends Includes<TypedDb, LocationWinners>, N extends Alias<LocationWinners>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<LocationWinners>, LocationWinners, U, N>): Promise<DebugResult<Array<MergeIncludes<LocationWinners, U> & ReturnTypes<N>>>>;
  winners<K extends keyof LocationWinners, N extends Alias<LocationWinners>>(query: ComplexSqlQueryObjectAlias<ToWhere<LocationWinners>, K, LocationWinners, N>): Promise<Array<Pick<LocationWinners, K> & ReturnTypes<N>>>;
  winners<K extends keyof LocationWinners, N extends Alias<LocationWinners>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<LocationWinners>, K, LocationWinners, N>): Promise<DebugResult<Array<Pick<LocationWinners, K> & ReturnTypes<N>>>>;
  winners<K extends keyof LocationWinners>(query: ComplexSqlQueryObject<ToWhere<LocationWinners>, K, LocationWinners>): Promise<Array<Pick<LocationWinners, K>>>;
  winners<K extends keyof LocationWinners>(query: ComplexSqlQueryObjectDebug<ToWhere<LocationWinners>, K, LocationWinners>): Promise<DebugResult<Array<Pick<LocationWinners, K>>>>;
  winners<K extends keyof LocationWinners>(query: ComplexSqlQueryObjectOmit<ToWhere<LocationWinners>, K, LocationWinners>): Promise<Array<Omit<LocationWinners, K>>>;
  winners<K extends keyof LocationWinners>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<LocationWinners>, K, LocationWinners>): Promise<DebugResult<Array<Omit<LocationWinners, K>>>>;
  winners<K extends keyof LocationWinners, N extends Alias<LocationWinners>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<LocationWinners>, K, LocationWinners, N>): Promise<Array<Omit<LocationWinners, K> & ReturnTypes<N>>>;
  winners<K extends keyof LocationWinners, N extends Alias<LocationWinners>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<LocationWinners>, K, LocationWinners, N>): Promise<DebugResult<Array<Omit<LocationWinners, K> & ReturnTypes<N>>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryObjectInclude<ToWhere<LocationWinners>, K, LocationWinners, U>): Promise<Array<MergeIncludes<Pick<LocationWinners, K>, U>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<LocationWinners>, K, LocationWinners, U>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationWinners, K>, U>>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<LocationWinners>, K, LocationWinners, U>): Promise<Array<MergeIncludes<Omit<LocationWinners, K>, U>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<LocationWinners>, K, LocationWinners, U>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationWinners, K>, U>>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>, N extends Alias<LocationWinners>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<LocationWinners>, K, LocationWinners, U, N>): Promise<Array<MergeIncludes<Pick<LocationWinners, K>, U> & ReturnTypes<N>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>, N extends Alias<LocationWinners>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<LocationWinners>, K, LocationWinners, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationWinners, K>, U> & ReturnTypes<N>>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>, N extends Alias<LocationWinners>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<LocationWinners>, K, LocationWinners, U, N>): Promise<Array<MergeIncludes<Omit<LocationWinners, K>, U> & ReturnTypes<N>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>, N extends Alias<LocationWinners>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<LocationWinners>, K, LocationWinners, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationWinners, K>, U> & ReturnTypes<N>>>>;
  winners<K extends keyof LocationWinners>(query: ComplexSqlQueryValue<ToWhere<LocationWinners>, K, LocationWinners>): Promise<Array<LocationWinners[K]>>;
  winners<K extends keyof LocationWinners>(query: ComplexSqlQueryValueDebug<ToWhere<LocationWinners>, K, LocationWinners>): Promise<DebugResult<Array<LocationWinners[K]>>>;
  winners(query: ComplexSqlQuery<ToWhere<LocationWinners>, LocationWinners>): Promise<Array<LocationWinners>>;
  winners(query: ComplexSqlQueryDebug<ToWhere<LocationWinners>, LocationWinners>): Promise<DebugResult<Array<LocationWinners>>>;
  winners<N>(query: ComplexSqlQuerySelector<ToWhere<LocationWinners>, LocationWinners, N>): Promise<Array<N>>;
  winners<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<LocationWinners>, LocationWinners, N>): Promise<DebugResult<Array<N>>>;
}

export interface Event {
  id: number;
  name: string;
  startTime: Date;
  locationId: number | null;
}

export interface InsertEvent {
  id?: number;
  name: string;
  startTime: Date;
  locationId?: number;
}

export interface WhereEvent {
  id?: number | Array<number> | WhereFunction<number>;
  name?: string | Array<string> | WhereFunction<string>;
  startTime?: Date | Array<Date> | WhereFunction<Date>;
  locationId?: number | Array<number> | WhereFunction<number> | null;
  and?: Array<WhereEvent>;
  or?: Array<WhereEvent>;
}

export interface EventFrom {
  test: number | null;
}

export interface EventLag {
  test1: number | null;
  test2: number | null;
  test3: number | null;
}

export interface EventOperator {
  result: number;
}

export interface EventSpaces {
  id: number;
  name: string;
  test: Array<{ id: number, name: string }>;
}

export interface EventTest {
  id: number;
  nest: { name: string, startTime: Date };
}

export interface EventQueries {
  from<N extends Alias<EventFrom>>(query: ComplexSqlQueryAlias<ToWhere<EventFrom>, EventFrom, N>): Promise<Array<EventFrom & ReturnTypes<N>>>;
  from<N extends Alias<EventFrom>>(query: ComplexSqlQueryAliasDebug<ToWhere<EventFrom>, EventFrom, N>): Promise<DebugResult<Array<EventFrom & ReturnTypes<N>>>>;
  from<U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryInclude<ToWhere<EventFrom>, EventFrom, U>): Promise<Array<MergeIncludes<EventFrom, U>>>;
  from<U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryIncludeDebug<ToWhere<EventFrom>, EventFrom, U>): Promise<DebugResult<Array<MergeIncludes<EventFrom, U>>>>;
  from<U extends Includes<TypedDb, EventFrom>, N extends Alias<EventFrom>>(query: ComplexSqlQueryIncludeAlias<ToWhere<EventFrom>, EventFrom, U, N>): Promise<Array<MergeIncludes<EventFrom, U> & ReturnTypes<N>>>;
  from<U extends Includes<TypedDb, EventFrom>, N extends Alias<EventFrom>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<EventFrom>, EventFrom, U, N>): Promise<DebugResult<Array<MergeIncludes<EventFrom, U> & ReturnTypes<N>>>>;
  from<K extends keyof EventFrom, N extends Alias<EventFrom>>(query: ComplexSqlQueryObjectAlias<ToWhere<EventFrom>, K, EventFrom, N>): Promise<Array<Pick<EventFrom, K> & ReturnTypes<N>>>;
  from<K extends keyof EventFrom, N extends Alias<EventFrom>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<EventFrom>, K, EventFrom, N>): Promise<DebugResult<Array<Pick<EventFrom, K> & ReturnTypes<N>>>>;
  from<K extends keyof EventFrom>(query: ComplexSqlQueryObject<ToWhere<EventFrom>, K, EventFrom>): Promise<Array<Pick<EventFrom, K>>>;
  from<K extends keyof EventFrom>(query: ComplexSqlQueryObjectDebug<ToWhere<EventFrom>, K, EventFrom>): Promise<DebugResult<Array<Pick<EventFrom, K>>>>;
  from<K extends keyof EventFrom>(query: ComplexSqlQueryObjectOmit<ToWhere<EventFrom>, K, EventFrom>): Promise<Array<Omit<EventFrom, K>>>;
  from<K extends keyof EventFrom>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<EventFrom>, K, EventFrom>): Promise<DebugResult<Array<Omit<EventFrom, K>>>>;
  from<K extends keyof EventFrom, N extends Alias<EventFrom>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<EventFrom>, K, EventFrom, N>): Promise<Array<Omit<EventFrom, K> & ReturnTypes<N>>>;
  from<K extends keyof EventFrom, N extends Alias<EventFrom>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<EventFrom>, K, EventFrom, N>): Promise<DebugResult<Array<Omit<EventFrom, K> & ReturnTypes<N>>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventFrom>, K, EventFrom, U>): Promise<Array<MergeIncludes<Pick<EventFrom, K>, U>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<EventFrom>, K, EventFrom, U>): Promise<DebugResult<Array<MergeIncludes<Pick<EventFrom, K>, U>>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventFrom>, K, EventFrom, U>): Promise<Array<MergeIncludes<Omit<EventFrom, K>, U>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<EventFrom>, K, EventFrom, U>): Promise<DebugResult<Array<MergeIncludes<Omit<EventFrom, K>, U>>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>, N extends Alias<EventFrom>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<EventFrom>, K, EventFrom, U, N>): Promise<Array<MergeIncludes<Pick<EventFrom, K>, U> & ReturnTypes<N>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>, N extends Alias<EventFrom>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<EventFrom>, K, EventFrom, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<EventFrom, K>, U> & ReturnTypes<N>>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>, N extends Alias<EventFrom>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<EventFrom>, K, EventFrom, U, N>): Promise<Array<MergeIncludes<Omit<EventFrom, K>, U> & ReturnTypes<N>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>, N extends Alias<EventFrom>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<EventFrom>, K, EventFrom, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<EventFrom, K>, U> & ReturnTypes<N>>>>;
  from<K extends keyof EventFrom>(query: ComplexSqlQueryValue<ToWhere<EventFrom>, K, EventFrom>): Promise<Array<EventFrom[K]>>;
  from<K extends keyof EventFrom>(query: ComplexSqlQueryValueDebug<ToWhere<EventFrom>, K, EventFrom>): Promise<DebugResult<Array<EventFrom[K]>>>;
  from(query: ComplexSqlQuery<ToWhere<EventFrom>, EventFrom>): Promise<Array<EventFrom>>;
  from(query: ComplexSqlQueryDebug<ToWhere<EventFrom>, EventFrom>): Promise<DebugResult<Array<EventFrom>>>;
  from<N>(query: ComplexSqlQuerySelector<ToWhere<EventFrom>, EventFrom, N>): Promise<Array<N>>;
  from<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<EventFrom>, EventFrom, N>): Promise<DebugResult<Array<N>>>;
  lag<N extends Alias<EventLag>>(query: ComplexSqlQueryAlias<ToWhere<EventLag>, EventLag, N>): Promise<Array<EventLag & ReturnTypes<N>>>;
  lag<N extends Alias<EventLag>>(query: ComplexSqlQueryAliasDebug<ToWhere<EventLag>, EventLag, N>): Promise<DebugResult<Array<EventLag & ReturnTypes<N>>>>;
  lag<U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryInclude<ToWhere<EventLag>, EventLag, U>): Promise<Array<MergeIncludes<EventLag, U>>>;
  lag<U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryIncludeDebug<ToWhere<EventLag>, EventLag, U>): Promise<DebugResult<Array<MergeIncludes<EventLag, U>>>>;
  lag<U extends Includes<TypedDb, EventLag>, N extends Alias<EventLag>>(query: ComplexSqlQueryIncludeAlias<ToWhere<EventLag>, EventLag, U, N>): Promise<Array<MergeIncludes<EventLag, U> & ReturnTypes<N>>>;
  lag<U extends Includes<TypedDb, EventLag>, N extends Alias<EventLag>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<EventLag>, EventLag, U, N>): Promise<DebugResult<Array<MergeIncludes<EventLag, U> & ReturnTypes<N>>>>;
  lag<K extends keyof EventLag, N extends Alias<EventLag>>(query: ComplexSqlQueryObjectAlias<ToWhere<EventLag>, K, EventLag, N>): Promise<Array<Pick<EventLag, K> & ReturnTypes<N>>>;
  lag<K extends keyof EventLag, N extends Alias<EventLag>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<EventLag>, K, EventLag, N>): Promise<DebugResult<Array<Pick<EventLag, K> & ReturnTypes<N>>>>;
  lag<K extends keyof EventLag>(query: ComplexSqlQueryObject<ToWhere<EventLag>, K, EventLag>): Promise<Array<Pick<EventLag, K>>>;
  lag<K extends keyof EventLag>(query: ComplexSqlQueryObjectDebug<ToWhere<EventLag>, K, EventLag>): Promise<DebugResult<Array<Pick<EventLag, K>>>>;
  lag<K extends keyof EventLag>(query: ComplexSqlQueryObjectOmit<ToWhere<EventLag>, K, EventLag>): Promise<Array<Omit<EventLag, K>>>;
  lag<K extends keyof EventLag>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<EventLag>, K, EventLag>): Promise<DebugResult<Array<Omit<EventLag, K>>>>;
  lag<K extends keyof EventLag, N extends Alias<EventLag>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<EventLag>, K, EventLag, N>): Promise<Array<Omit<EventLag, K> & ReturnTypes<N>>>;
  lag<K extends keyof EventLag, N extends Alias<EventLag>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<EventLag>, K, EventLag, N>): Promise<DebugResult<Array<Omit<EventLag, K> & ReturnTypes<N>>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventLag>, K, EventLag, U>): Promise<Array<MergeIncludes<Pick<EventLag, K>, U>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<EventLag>, K, EventLag, U>): Promise<DebugResult<Array<MergeIncludes<Pick<EventLag, K>, U>>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventLag>, K, EventLag, U>): Promise<Array<MergeIncludes<Omit<EventLag, K>, U>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<EventLag>, K, EventLag, U>): Promise<DebugResult<Array<MergeIncludes<Omit<EventLag, K>, U>>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>, N extends Alias<EventLag>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<EventLag>, K, EventLag, U, N>): Promise<Array<MergeIncludes<Pick<EventLag, K>, U> & ReturnTypes<N>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>, N extends Alias<EventLag>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<EventLag>, K, EventLag, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<EventLag, K>, U> & ReturnTypes<N>>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>, N extends Alias<EventLag>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<EventLag>, K, EventLag, U, N>): Promise<Array<MergeIncludes<Omit<EventLag, K>, U> & ReturnTypes<N>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>, N extends Alias<EventLag>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<EventLag>, K, EventLag, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<EventLag, K>, U> & ReturnTypes<N>>>>;
  lag<K extends keyof EventLag>(query: ComplexSqlQueryValue<ToWhere<EventLag>, K, EventLag>): Promise<Array<EventLag[K]>>;
  lag<K extends keyof EventLag>(query: ComplexSqlQueryValueDebug<ToWhere<EventLag>, K, EventLag>): Promise<DebugResult<Array<EventLag[K]>>>;
  lag(query: ComplexSqlQuery<ToWhere<EventLag>, EventLag>): Promise<Array<EventLag>>;
  lag(query: ComplexSqlQueryDebug<ToWhere<EventLag>, EventLag>): Promise<DebugResult<Array<EventLag>>>;
  lag<N>(query: ComplexSqlQuerySelector<ToWhere<EventLag>, EventLag, N>): Promise<Array<N>>;
  lag<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<EventLag>, EventLag, N>): Promise<DebugResult<Array<N>>>;
  operator<N extends Alias<EventOperator>>(query: ComplexSqlQueryAlias<ToWhere<EventOperator>, EventOperator, N>): Promise<Array<EventOperator & ReturnTypes<N>>>;
  operator<N extends Alias<EventOperator>>(query: ComplexSqlQueryAliasDebug<ToWhere<EventOperator>, EventOperator, N>): Promise<DebugResult<Array<EventOperator & ReturnTypes<N>>>>;
  operator<U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryInclude<ToWhere<EventOperator>, EventOperator, U>): Promise<Array<MergeIncludes<EventOperator, U>>>;
  operator<U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryIncludeDebug<ToWhere<EventOperator>, EventOperator, U>): Promise<DebugResult<Array<MergeIncludes<EventOperator, U>>>>;
  operator<U extends Includes<TypedDb, EventOperator>, N extends Alias<EventOperator>>(query: ComplexSqlQueryIncludeAlias<ToWhere<EventOperator>, EventOperator, U, N>): Promise<Array<MergeIncludes<EventOperator, U> & ReturnTypes<N>>>;
  operator<U extends Includes<TypedDb, EventOperator>, N extends Alias<EventOperator>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<EventOperator>, EventOperator, U, N>): Promise<DebugResult<Array<MergeIncludes<EventOperator, U> & ReturnTypes<N>>>>;
  operator<K extends keyof EventOperator, N extends Alias<EventOperator>>(query: ComplexSqlQueryObjectAlias<ToWhere<EventOperator>, K, EventOperator, N>): Promise<Array<Pick<EventOperator, K> & ReturnTypes<N>>>;
  operator<K extends keyof EventOperator, N extends Alias<EventOperator>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<EventOperator>, K, EventOperator, N>): Promise<DebugResult<Array<Pick<EventOperator, K> & ReturnTypes<N>>>>;
  operator<K extends keyof EventOperator>(query: ComplexSqlQueryObject<ToWhere<EventOperator>, K, EventOperator>): Promise<Array<Pick<EventOperator, K>>>;
  operator<K extends keyof EventOperator>(query: ComplexSqlQueryObjectDebug<ToWhere<EventOperator>, K, EventOperator>): Promise<DebugResult<Array<Pick<EventOperator, K>>>>;
  operator<K extends keyof EventOperator>(query: ComplexSqlQueryObjectOmit<ToWhere<EventOperator>, K, EventOperator>): Promise<Array<Omit<EventOperator, K>>>;
  operator<K extends keyof EventOperator>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<EventOperator>, K, EventOperator>): Promise<DebugResult<Array<Omit<EventOperator, K>>>>;
  operator<K extends keyof EventOperator, N extends Alias<EventOperator>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<EventOperator>, K, EventOperator, N>): Promise<Array<Omit<EventOperator, K> & ReturnTypes<N>>>;
  operator<K extends keyof EventOperator, N extends Alias<EventOperator>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<EventOperator>, K, EventOperator, N>): Promise<DebugResult<Array<Omit<EventOperator, K> & ReturnTypes<N>>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventOperator>, K, EventOperator, U>): Promise<Array<MergeIncludes<Pick<EventOperator, K>, U>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<EventOperator>, K, EventOperator, U>): Promise<DebugResult<Array<MergeIncludes<Pick<EventOperator, K>, U>>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventOperator>, K, EventOperator, U>): Promise<Array<MergeIncludes<Omit<EventOperator, K>, U>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<EventOperator>, K, EventOperator, U>): Promise<DebugResult<Array<MergeIncludes<Omit<EventOperator, K>, U>>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>, N extends Alias<EventOperator>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<EventOperator>, K, EventOperator, U, N>): Promise<Array<MergeIncludes<Pick<EventOperator, K>, U> & ReturnTypes<N>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>, N extends Alias<EventOperator>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<EventOperator>, K, EventOperator, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<EventOperator, K>, U> & ReturnTypes<N>>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>, N extends Alias<EventOperator>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<EventOperator>, K, EventOperator, U, N>): Promise<Array<MergeIncludes<Omit<EventOperator, K>, U> & ReturnTypes<N>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>, N extends Alias<EventOperator>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<EventOperator>, K, EventOperator, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<EventOperator, K>, U> & ReturnTypes<N>>>>;
  operator<K extends keyof EventOperator>(query: ComplexSqlQueryValue<ToWhere<EventOperator>, K, EventOperator>): Promise<Array<EventOperator[K]>>;
  operator<K extends keyof EventOperator>(query: ComplexSqlQueryValueDebug<ToWhere<EventOperator>, K, EventOperator>): Promise<DebugResult<Array<EventOperator[K]>>>;
  operator(query: ComplexSqlQuery<ToWhere<EventOperator>, EventOperator>): Promise<Array<EventOperator>>;
  operator(query: ComplexSqlQueryDebug<ToWhere<EventOperator>, EventOperator>): Promise<DebugResult<Array<EventOperator>>>;
  operator<N>(query: ComplexSqlQuerySelector<ToWhere<EventOperator>, EventOperator, N>): Promise<Array<N>>;
  operator<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<EventOperator>, EventOperator, N>): Promise<DebugResult<Array<N>>>;
  spaces<N extends Alias<EventSpaces>>(query: ComplexSqlQueryAlias<ToWhere<EventSpaces>, EventSpaces, N>): Promise<Array<EventSpaces & ReturnTypes<N>>>;
  spaces<N extends Alias<EventSpaces>>(query: ComplexSqlQueryAliasDebug<ToWhere<EventSpaces>, EventSpaces, N>): Promise<DebugResult<Array<EventSpaces & ReturnTypes<N>>>>;
  spaces<U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryInclude<ToWhere<EventSpaces>, EventSpaces, U>): Promise<Array<MergeIncludes<EventSpaces, U>>>;
  spaces<U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryIncludeDebug<ToWhere<EventSpaces>, EventSpaces, U>): Promise<DebugResult<Array<MergeIncludes<EventSpaces, U>>>>;
  spaces<U extends Includes<TypedDb, EventSpaces>, N extends Alias<EventSpaces>>(query: ComplexSqlQueryIncludeAlias<ToWhere<EventSpaces>, EventSpaces, U, N>): Promise<Array<MergeIncludes<EventSpaces, U> & ReturnTypes<N>>>;
  spaces<U extends Includes<TypedDb, EventSpaces>, N extends Alias<EventSpaces>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<EventSpaces>, EventSpaces, U, N>): Promise<DebugResult<Array<MergeIncludes<EventSpaces, U> & ReturnTypes<N>>>>;
  spaces<K extends keyof EventSpaces, N extends Alias<EventSpaces>>(query: ComplexSqlQueryObjectAlias<ToWhere<EventSpaces>, K, EventSpaces, N>): Promise<Array<Pick<EventSpaces, K> & ReturnTypes<N>>>;
  spaces<K extends keyof EventSpaces, N extends Alias<EventSpaces>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<EventSpaces>, K, EventSpaces, N>): Promise<DebugResult<Array<Pick<EventSpaces, K> & ReturnTypes<N>>>>;
  spaces<K extends keyof EventSpaces>(query: ComplexSqlQueryObject<ToWhere<EventSpaces>, K, EventSpaces>): Promise<Array<Pick<EventSpaces, K>>>;
  spaces<K extends keyof EventSpaces>(query: ComplexSqlQueryObjectDebug<ToWhere<EventSpaces>, K, EventSpaces>): Promise<DebugResult<Array<Pick<EventSpaces, K>>>>;
  spaces<K extends keyof EventSpaces>(query: ComplexSqlQueryObjectOmit<ToWhere<EventSpaces>, K, EventSpaces>): Promise<Array<Omit<EventSpaces, K>>>;
  spaces<K extends keyof EventSpaces>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<EventSpaces>, K, EventSpaces>): Promise<DebugResult<Array<Omit<EventSpaces, K>>>>;
  spaces<K extends keyof EventSpaces, N extends Alias<EventSpaces>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<EventSpaces>, K, EventSpaces, N>): Promise<Array<Omit<EventSpaces, K> & ReturnTypes<N>>>;
  spaces<K extends keyof EventSpaces, N extends Alias<EventSpaces>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<EventSpaces>, K, EventSpaces, N>): Promise<DebugResult<Array<Omit<EventSpaces, K> & ReturnTypes<N>>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventSpaces>, K, EventSpaces, U>): Promise<Array<MergeIncludes<Pick<EventSpaces, K>, U>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<EventSpaces>, K, EventSpaces, U>): Promise<DebugResult<Array<MergeIncludes<Pick<EventSpaces, K>, U>>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventSpaces>, K, EventSpaces, U>): Promise<Array<MergeIncludes<Omit<EventSpaces, K>, U>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<EventSpaces>, K, EventSpaces, U>): Promise<DebugResult<Array<MergeIncludes<Omit<EventSpaces, K>, U>>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>, N extends Alias<EventSpaces>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<EventSpaces>, K, EventSpaces, U, N>): Promise<Array<MergeIncludes<Pick<EventSpaces, K>, U> & ReturnTypes<N>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>, N extends Alias<EventSpaces>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<EventSpaces>, K, EventSpaces, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<EventSpaces, K>, U> & ReturnTypes<N>>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>, N extends Alias<EventSpaces>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<EventSpaces>, K, EventSpaces, U, N>): Promise<Array<MergeIncludes<Omit<EventSpaces, K>, U> & ReturnTypes<N>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>, N extends Alias<EventSpaces>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<EventSpaces>, K, EventSpaces, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<EventSpaces, K>, U> & ReturnTypes<N>>>>;
  spaces<K extends keyof EventSpaces>(query: ComplexSqlQueryValue<ToWhere<EventSpaces>, K, EventSpaces>): Promise<Array<EventSpaces[K]>>;
  spaces<K extends keyof EventSpaces>(query: ComplexSqlQueryValueDebug<ToWhere<EventSpaces>, K, EventSpaces>): Promise<DebugResult<Array<EventSpaces[K]>>>;
  spaces(query: ComplexSqlQuery<ToWhere<EventSpaces>, EventSpaces>): Promise<Array<EventSpaces>>;
  spaces(query: ComplexSqlQueryDebug<ToWhere<EventSpaces>, EventSpaces>): Promise<DebugResult<Array<EventSpaces>>>;
  spaces<N>(query: ComplexSqlQuerySelector<ToWhere<EventSpaces>, EventSpaces, N>): Promise<Array<N>>;
  spaces<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<EventSpaces>, EventSpaces, N>): Promise<DebugResult<Array<N>>>;
  test<N extends Alias<EventTest>>(query: ComplexSqlQueryAlias<ToWhere<EventTest>, EventTest, N>): Promise<Array<EventTest & ReturnTypes<N>>>;
  test<N extends Alias<EventTest>>(query: ComplexSqlQueryAliasDebug<ToWhere<EventTest>, EventTest, N>): Promise<DebugResult<Array<EventTest & ReturnTypes<N>>>>;
  test<U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryInclude<ToWhere<EventTest>, EventTest, U>): Promise<Array<MergeIncludes<EventTest, U>>>;
  test<U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryIncludeDebug<ToWhere<EventTest>, EventTest, U>): Promise<DebugResult<Array<MergeIncludes<EventTest, U>>>>;
  test<U extends Includes<TypedDb, EventTest>, N extends Alias<EventTest>>(query: ComplexSqlQueryIncludeAlias<ToWhere<EventTest>, EventTest, U, N>): Promise<Array<MergeIncludes<EventTest, U> & ReturnTypes<N>>>;
  test<U extends Includes<TypedDb, EventTest>, N extends Alias<EventTest>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<EventTest>, EventTest, U, N>): Promise<DebugResult<Array<MergeIncludes<EventTest, U> & ReturnTypes<N>>>>;
  test<K extends keyof EventTest, N extends Alias<EventTest>>(query: ComplexSqlQueryObjectAlias<ToWhere<EventTest>, K, EventTest, N>): Promise<Array<Pick<EventTest, K> & ReturnTypes<N>>>;
  test<K extends keyof EventTest, N extends Alias<EventTest>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<EventTest>, K, EventTest, N>): Promise<DebugResult<Array<Pick<EventTest, K> & ReturnTypes<N>>>>;
  test<K extends keyof EventTest>(query: ComplexSqlQueryObject<ToWhere<EventTest>, K, EventTest>): Promise<Array<Pick<EventTest, K>>>;
  test<K extends keyof EventTest>(query: ComplexSqlQueryObjectDebug<ToWhere<EventTest>, K, EventTest>): Promise<DebugResult<Array<Pick<EventTest, K>>>>;
  test<K extends keyof EventTest>(query: ComplexSqlQueryObjectOmit<ToWhere<EventTest>, K, EventTest>): Promise<Array<Omit<EventTest, K>>>;
  test<K extends keyof EventTest>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<EventTest>, K, EventTest>): Promise<DebugResult<Array<Omit<EventTest, K>>>>;
  test<K extends keyof EventTest, N extends Alias<EventTest>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<EventTest>, K, EventTest, N>): Promise<Array<Omit<EventTest, K> & ReturnTypes<N>>>;
  test<K extends keyof EventTest, N extends Alias<EventTest>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<EventTest>, K, EventTest, N>): Promise<DebugResult<Array<Omit<EventTest, K> & ReturnTypes<N>>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventTest>, K, EventTest, U>): Promise<Array<MergeIncludes<Pick<EventTest, K>, U>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<EventTest>, K, EventTest, U>): Promise<DebugResult<Array<MergeIncludes<Pick<EventTest, K>, U>>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventTest>, K, EventTest, U>): Promise<Array<MergeIncludes<Omit<EventTest, K>, U>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<EventTest>, K, EventTest, U>): Promise<DebugResult<Array<MergeIncludes<Omit<EventTest, K>, U>>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>, N extends Alias<EventTest>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<EventTest>, K, EventTest, U, N>): Promise<Array<MergeIncludes<Pick<EventTest, K>, U> & ReturnTypes<N>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>, N extends Alias<EventTest>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<EventTest>, K, EventTest, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<EventTest, K>, U> & ReturnTypes<N>>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>, N extends Alias<EventTest>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<EventTest>, K, EventTest, U, N>): Promise<Array<MergeIncludes<Omit<EventTest, K>, U> & ReturnTypes<N>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>, N extends Alias<EventTest>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<EventTest>, K, EventTest, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<EventTest, K>, U> & ReturnTypes<N>>>>;
  test<K extends keyof EventTest>(query: ComplexSqlQueryValue<ToWhere<EventTest>, K, EventTest>): Promise<Array<EventTest[K]>>;
  test<K extends keyof EventTest>(query: ComplexSqlQueryValueDebug<ToWhere<EventTest>, K, EventTest>): Promise<DebugResult<Array<EventTest[K]>>>;
  test(query: ComplexSqlQuery<ToWhere<EventTest>, EventTest>): Promise<Array<EventTest>>;
  test(query: ComplexSqlQueryDebug<ToWhere<EventTest>, EventTest>): Promise<DebugResult<Array<EventTest>>>;
  test<N>(query: ComplexSqlQuerySelector<ToWhere<EventTest>, EventTest, N>): Promise<Array<N>>;
  test<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<EventTest>, EventTest, N>): Promise<DebugResult<Array<N>>>;
}

export interface Card {
  id: number;
  eventId: number;
  cardName: string;
  cardOrder: number;
  startTime: Date | null;
}

export interface InsertCard {
  id?: number;
  eventId: number;
  cardName: string;
  cardOrder: number;
  startTime?: Date;
}

export interface WhereCard {
  id?: number | Array<number> | WhereFunction<number>;
  eventId?: number | Array<number> | WhereFunction<number>;
  cardName?: string | Array<string> | WhereFunction<string>;
  cardOrder?: number | Array<number> | WhereFunction<number>;
  startTime?: Date | Array<Date> | WhereFunction<Date> | null;
  and?: Array<WhereCard>;
  or?: Array<WhereCard>;
}

export interface Coach {
  id: number;
  name: string;
  city: string;
  profile: [] | null;
}

export interface InsertCoach {
  id?: number;
  name: string;
  city: string;
  profile?: Json;
}

export interface WhereCoach {
  id?: number | Array<number> | WhereFunction<number>;
  name?: string | Array<string> | WhereFunction<string>;
  city?: string | Array<string> | WhereFunction<string>;
  profile?: WhereFunction<[]> | null;
  and?: Array<WhereCoach>;
  or?: Array<WhereCoach>;
}

export interface CoachFrom {
  id: number;
}

export interface CoachQueries {
  from<N extends Alias<CoachFrom>>(query: ComplexSqlQueryAlias<ToWhere<CoachFrom>, CoachFrom, N>): Promise<Array<CoachFrom & ReturnTypes<N>>>;
  from<N extends Alias<CoachFrom>>(query: ComplexSqlQueryAliasDebug<ToWhere<CoachFrom>, CoachFrom, N>): Promise<DebugResult<Array<CoachFrom & ReturnTypes<N>>>>;
  from<U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryInclude<ToWhere<CoachFrom>, CoachFrom, U>): Promise<Array<MergeIncludes<CoachFrom, U>>>;
  from<U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryIncludeDebug<ToWhere<CoachFrom>, CoachFrom, U>): Promise<DebugResult<Array<MergeIncludes<CoachFrom, U>>>>;
  from<U extends Includes<TypedDb, CoachFrom>, N extends Alias<CoachFrom>>(query: ComplexSqlQueryIncludeAlias<ToWhere<CoachFrom>, CoachFrom, U, N>): Promise<Array<MergeIncludes<CoachFrom, U> & ReturnTypes<N>>>;
  from<U extends Includes<TypedDb, CoachFrom>, N extends Alias<CoachFrom>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<CoachFrom>, CoachFrom, U, N>): Promise<DebugResult<Array<MergeIncludes<CoachFrom, U> & ReturnTypes<N>>>>;
  from<K extends keyof CoachFrom, N extends Alias<CoachFrom>>(query: ComplexSqlQueryObjectAlias<ToWhere<CoachFrom>, K, CoachFrom, N>): Promise<Array<Pick<CoachFrom, K> & ReturnTypes<N>>>;
  from<K extends keyof CoachFrom, N extends Alias<CoachFrom>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<CoachFrom>, K, CoachFrom, N>): Promise<DebugResult<Array<Pick<CoachFrom, K> & ReturnTypes<N>>>>;
  from<K extends keyof CoachFrom>(query: ComplexSqlQueryObject<ToWhere<CoachFrom>, K, CoachFrom>): Promise<Array<Pick<CoachFrom, K>>>;
  from<K extends keyof CoachFrom>(query: ComplexSqlQueryObjectDebug<ToWhere<CoachFrom>, K, CoachFrom>): Promise<DebugResult<Array<Pick<CoachFrom, K>>>>;
  from<K extends keyof CoachFrom>(query: ComplexSqlQueryObjectOmit<ToWhere<CoachFrom>, K, CoachFrom>): Promise<Array<Omit<CoachFrom, K>>>;
  from<K extends keyof CoachFrom>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<CoachFrom>, K, CoachFrom>): Promise<DebugResult<Array<Omit<CoachFrom, K>>>>;
  from<K extends keyof CoachFrom, N extends Alias<CoachFrom>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<CoachFrom>, K, CoachFrom, N>): Promise<Array<Omit<CoachFrom, K> & ReturnTypes<N>>>;
  from<K extends keyof CoachFrom, N extends Alias<CoachFrom>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<CoachFrom>, K, CoachFrom, N>): Promise<DebugResult<Array<Omit<CoachFrom, K> & ReturnTypes<N>>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryObjectInclude<ToWhere<CoachFrom>, K, CoachFrom, U>): Promise<Array<MergeIncludes<Pick<CoachFrom, K>, U>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<CoachFrom>, K, CoachFrom, U>): Promise<DebugResult<Array<MergeIncludes<Pick<CoachFrom, K>, U>>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<CoachFrom>, K, CoachFrom, U>): Promise<Array<MergeIncludes<Omit<CoachFrom, K>, U>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<CoachFrom>, K, CoachFrom, U>): Promise<DebugResult<Array<MergeIncludes<Omit<CoachFrom, K>, U>>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>, N extends Alias<CoachFrom>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<CoachFrom>, K, CoachFrom, U, N>): Promise<Array<MergeIncludes<Pick<CoachFrom, K>, U> & ReturnTypes<N>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>, N extends Alias<CoachFrom>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<CoachFrom>, K, CoachFrom, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<CoachFrom, K>, U> & ReturnTypes<N>>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>, N extends Alias<CoachFrom>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<CoachFrom>, K, CoachFrom, U, N>): Promise<Array<MergeIncludes<Omit<CoachFrom, K>, U> & ReturnTypes<N>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>, N extends Alias<CoachFrom>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<CoachFrom>, K, CoachFrom, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<CoachFrom, K>, U> & ReturnTypes<N>>>>;
  from<K extends keyof CoachFrom>(query: ComplexSqlQueryValue<ToWhere<CoachFrom>, K, CoachFrom>): Promise<Array<CoachFrom[K]>>;
  from<K extends keyof CoachFrom>(query: ComplexSqlQueryValueDebug<ToWhere<CoachFrom>, K, CoachFrom>): Promise<DebugResult<Array<CoachFrom[K]>>>;
  from(query: ComplexSqlQuery<ToWhere<CoachFrom>, CoachFrom>): Promise<Array<CoachFrom>>;
  from(query: ComplexSqlQueryDebug<ToWhere<CoachFrom>, CoachFrom>): Promise<DebugResult<Array<CoachFrom>>>;
  from<N>(query: ComplexSqlQuerySelector<ToWhere<CoachFrom>, CoachFrom, N>): Promise<Array<N>>;
  from<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<CoachFrom>, CoachFrom, N>): Promise<DebugResult<Array<N>>>;
}

export interface Fighter {
  id: number;
  name: string;
  nickname: string | null;
  born: string | null;
  heightCm: number | null;
  reachCm: number | null;
  hometown: string;
  social: (Social & JsonObject) | null;
  isActive: boolean;
  phone: string[] | null;
  documents: (Document & JsonObject)[] | null;
}

interface Social {
  instagram?: string,
  twitter?: string
}

interface Document {
  documentId: number,
  documentName: string,
  files: (File & JsonObject)[]
}

interface File {
  name: string,
  tags: string[]
}

export interface InsertFighter {
  id?: number;
  name: string;
  nickname?: string;
  born?: string;
  heightCm?: number;
  reachCm?: number;
  hometown: string;
  social?: Json;
  isActive: boolean;
  phone?: Json;
  documents?: Json;
}

export interface WhereFighter {
  id?: number | Array<number> | WhereFunction<number>;
  name?: string | Array<string> | WhereFunction<string>;
  nickname?: string | Array<string> | WhereFunction<string> | null;
  born?: string | Array<string> | WhereFunction<string> | null;
  heightCm?: number | Array<number> | WhereFunction<number> | null;
  reachCm?: number | Array<number> | WhereFunction<number> | null;
  hometown?: string | Array<string> | WhereFunction<string>;
  social?: WhereFunction<(Social & JsonObject) | null> | null;
  isActive?: boolean | Array<boolean> | WhereFunction<boolean>;
  phone?: WhereFunction<string[] | null> | null;
  documents?: WhereFunction<(Document & JsonObject)[] | null> | null;
  and?: Array<WhereFighter>;
  or?: Array<WhereFighter>;
}

export interface FighterByHeight {
  name: string;
  heightCm: number | null;
  heightRank: number;
}

export interface FighterCommon {
  red: { id: number, name: string };
  blue: { id: number, name: string };
  winnerId: number | null;
  method: string;
  description: string | null;
  event: { id: number, name: string, date: Date };
}

export interface FighterExtract {
  instagram: number | string | Buffer | null;
}

export interface FighterFilter {
  name: string;
  reaches: string | null;
}

export interface FighterInstagram {
  instagram: number | string | Buffer;
}

export interface FighterLastFights {
  name: string;
  dates: Array<Date>;
}

export interface FighterLeft {
  id: number;
  winnerId: number | null;
  winnerName: string | null;
}

export interface FighterMethods {
  method: string;
  count: number;
}

export interface FighterOpponents {
  opponentId: number;
  name: string;
}

export interface FighterOtherNames {
  name: string;
  otherNames: Array<string>;
}

export interface FighterRight {
  id: number;
  winnerId: number;
  winnerName: string;
}

export interface FighterWeightClasses {
  name: string;
  weightClasses: Array<{ id: number, name: string, test: boolean, nest: { id: number, age: boolean } }>;
}

export interface FighterWithReach {
  name: string;
  heightCm: number | null;
  reachCm: number | null;
  reaches: Array<number>;
}

export interface FighterCommonParams {
  fighter1: any;
  fighter2: any;
}

export interface FighterExtractParams {
  path: any;
}

export interface FighterLastFightsParams {
  id: any;
}

export interface FighterMethodsParams {
  id: any;
}

export interface FighterWeightClassesParams {
  fighterId: any;
}

export interface FighterQueries {
  byHeight<N extends Alias<FighterByHeight>>(query: ComplexSqlQueryAlias<ToWhere<FighterByHeight>, FighterByHeight, N>): Promise<Array<FighterByHeight & ReturnTypes<N>>>;
  byHeight<N extends Alias<FighterByHeight>>(query: ComplexSqlQueryAliasDebug<ToWhere<FighterByHeight>, FighterByHeight, N>): Promise<DebugResult<Array<FighterByHeight & ReturnTypes<N>>>>;
  byHeight<U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryInclude<ToWhere<FighterByHeight>, FighterByHeight, U>): Promise<Array<MergeIncludes<FighterByHeight, U>>>;
  byHeight<U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterByHeight>, FighterByHeight, U>): Promise<DebugResult<Array<MergeIncludes<FighterByHeight, U>>>>;
  byHeight<U extends Includes<TypedDb, FighterByHeight>, N extends Alias<FighterByHeight>>(query: ComplexSqlQueryIncludeAlias<ToWhere<FighterByHeight>, FighterByHeight, U, N>): Promise<Array<MergeIncludes<FighterByHeight, U> & ReturnTypes<N>>>;
  byHeight<U extends Includes<TypedDb, FighterByHeight>, N extends Alias<FighterByHeight>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<FighterByHeight>, FighterByHeight, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterByHeight, U> & ReturnTypes<N>>>>;
  byHeight<K extends keyof FighterByHeight, N extends Alias<FighterByHeight>>(query: ComplexSqlQueryObjectAlias<ToWhere<FighterByHeight>, K, FighterByHeight, N>): Promise<Array<Pick<FighterByHeight, K> & ReturnTypes<N>>>;
  byHeight<K extends keyof FighterByHeight, N extends Alias<FighterByHeight>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<FighterByHeight>, K, FighterByHeight, N>): Promise<DebugResult<Array<Pick<FighterByHeight, K> & ReturnTypes<N>>>>;
  byHeight<K extends keyof FighterByHeight>(query: ComplexSqlQueryObject<ToWhere<FighterByHeight>, K, FighterByHeight>): Promise<Array<Pick<FighterByHeight, K>>>;
  byHeight<K extends keyof FighterByHeight>(query: ComplexSqlQueryObjectDebug<ToWhere<FighterByHeight>, K, FighterByHeight>): Promise<DebugResult<Array<Pick<FighterByHeight, K>>>>;
  byHeight<K extends keyof FighterByHeight>(query: ComplexSqlQueryObjectOmit<ToWhere<FighterByHeight>, K, FighterByHeight>): Promise<Array<Omit<FighterByHeight, K>>>;
  byHeight<K extends keyof FighterByHeight>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<FighterByHeight>, K, FighterByHeight>): Promise<DebugResult<Array<Omit<FighterByHeight, K>>>>;
  byHeight<K extends keyof FighterByHeight, N extends Alias<FighterByHeight>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<FighterByHeight>, K, FighterByHeight, N>): Promise<Array<Omit<FighterByHeight, K> & ReturnTypes<N>>>;
  byHeight<K extends keyof FighterByHeight, N extends Alias<FighterByHeight>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<FighterByHeight>, K, FighterByHeight, N>): Promise<DebugResult<Array<Omit<FighterByHeight, K> & ReturnTypes<N>>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterByHeight>, K, FighterByHeight, U>): Promise<Array<MergeIncludes<Pick<FighterByHeight, K>, U>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterByHeight>, K, FighterByHeight, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterByHeight, K>, U>>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterByHeight>, K, FighterByHeight, U>): Promise<Array<MergeIncludes<Omit<FighterByHeight, K>, U>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterByHeight>, K, FighterByHeight, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterByHeight, K>, U>>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>, N extends Alias<FighterByHeight>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<FighterByHeight>, K, FighterByHeight, U, N>): Promise<Array<MergeIncludes<Pick<FighterByHeight, K>, U> & ReturnTypes<N>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>, N extends Alias<FighterByHeight>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<FighterByHeight>, K, FighterByHeight, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterByHeight, K>, U> & ReturnTypes<N>>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>, N extends Alias<FighterByHeight>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<FighterByHeight>, K, FighterByHeight, U, N>): Promise<Array<MergeIncludes<Omit<FighterByHeight, K>, U> & ReturnTypes<N>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>, N extends Alias<FighterByHeight>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<FighterByHeight>, K, FighterByHeight, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterByHeight, K>, U> & ReturnTypes<N>>>>;
  byHeight<K extends keyof FighterByHeight>(query: ComplexSqlQueryValue<ToWhere<FighterByHeight>, K, FighterByHeight>): Promise<Array<FighterByHeight[K]>>;
  byHeight<K extends keyof FighterByHeight>(query: ComplexSqlQueryValueDebug<ToWhere<FighterByHeight>, K, FighterByHeight>): Promise<DebugResult<Array<FighterByHeight[K]>>>;
  byHeight(query: ComplexSqlQuery<ToWhere<FighterByHeight>, FighterByHeight>): Promise<Array<FighterByHeight>>;
  byHeight(query: ComplexSqlQueryDebug<ToWhere<FighterByHeight>, FighterByHeight>): Promise<DebugResult<Array<FighterByHeight>>>;
  byHeight<N>(query: ComplexSqlQuerySelector<ToWhere<FighterByHeight>, FighterByHeight, N>): Promise<Array<N>>;
  byHeight<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterByHeight>, FighterByHeight, N>): Promise<DebugResult<Array<N>>>;
  common<N extends Alias<FighterCommon>>(query: ComplexSqlQueryAliasParams<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, N>): Promise<Array<FighterCommon & ReturnTypes<N>>>;
  common<N extends Alias<FighterCommon>>(query: ComplexSqlQueryAliasParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, N>): Promise<DebugResult<Array<FighterCommon & ReturnTypes<N>>>>;
  common<U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryIncludeParams<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, U>): Promise<Array<MergeIncludes<FighterCommon, U>>>;
  common<U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryIncludeParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, U>): Promise<DebugResult<Array<MergeIncludes<FighterCommon, U>>>>;
  common<U extends Includes<TypedDb, FighterCommon>, N extends Alias<FighterCommon>>(query: ComplexSqlQueryIncludeAliasParams<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, U, N>): Promise<Array<MergeIncludes<FighterCommon, U> & ReturnTypes<N>>>;
  common<U extends Includes<TypedDb, FighterCommon>, N extends Alias<FighterCommon>>(query: ComplexSqlQueryIncludeAliasParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterCommon, U> & ReturnTypes<N>>>>;
  common<K extends keyof FighterCommon, N extends Alias<FighterCommon>>(query: ComplexSqlQueryObjectAliasParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, N>): Promise<Array<Pick<FighterCommon, K> & ReturnTypes<N>>>;
  common<K extends keyof FighterCommon, N extends Alias<FighterCommon>>(query: ComplexSqlQueryObjectAliasParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, N>): Promise<DebugResult<Array<Pick<FighterCommon, K> & ReturnTypes<N>>>>;
  common<K extends keyof FighterCommon>(query: ComplexSqlQueryObjectParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon>): Promise<Array<Pick<FighterCommon, K>>>;
  common<K extends keyof FighterCommon>(query: ComplexSqlQueryObjectParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon>): Promise<DebugResult<Array<Pick<FighterCommon, K>>>>;
  common<K extends keyof FighterCommon>(query: ComplexSqlQueryObjectOmitParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon>): Promise<Array<Omit<FighterCommon, K>>>;
  common<K extends keyof FighterCommon>(query: ComplexSqlQueryObjectOmitParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon>): Promise<DebugResult<Array<Omit<FighterCommon, K>>>>;
  common<K extends keyof FighterCommon, N extends Alias<FighterCommon>>(query: ComplexSqlQueryObjectAliasOmitParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, N>): Promise<Array<Omit<FighterCommon, K> & ReturnTypes<N>>>;
  common<K extends keyof FighterCommon, N extends Alias<FighterCommon>>(query: ComplexSqlQueryObjectAliasOmitParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, N>): Promise<DebugResult<Array<Omit<FighterCommon, K> & ReturnTypes<N>>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryObjectIncludeParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U>): Promise<Array<MergeIncludes<Pick<FighterCommon, K>, U>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryObjectIncludeParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterCommon, K>, U>>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U>): Promise<Array<MergeIncludes<Omit<FighterCommon, K>, U>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterCommon, K>, U>>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>, N extends Alias<FighterCommon>>(query: ComplexSqlQueryObjectIncludeAliasParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U, N>): Promise<Array<MergeIncludes<Pick<FighterCommon, K>, U> & ReturnTypes<N>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>, N extends Alias<FighterCommon>>(query: ComplexSqlQueryObjectIncludeAliasParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterCommon, K>, U> & ReturnTypes<N>>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>, N extends Alias<FighterCommon>>(query: ComplexSqlQueryObjectIncludeAliasOmitParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U, N>): Promise<Array<MergeIncludes<Omit<FighterCommon, K>, U> & ReturnTypes<N>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>, N extends Alias<FighterCommon>>(query: ComplexSqlQueryObjectIncludeAliasOmitParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterCommon, K>, U> & ReturnTypes<N>>>>;
  common<K extends keyof FighterCommon>(query: ComplexSqlQueryValueParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon>): Promise<Array<FighterCommon[K]>>;
  common<K extends keyof FighterCommon>(query: ComplexSqlQueryValueParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon>): Promise<DebugResult<Array<FighterCommon[K]>>>;
  common(query: ComplexSqlQueryParams<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon>): Promise<Array<FighterCommon>>;
  common(query: ComplexSqlQueryParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon>): Promise<DebugResult<Array<FighterCommon>>>;
  common<N>(query: ComplexSqlQuerySelectorParams<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, N>): Promise<Array<N>>;
  common<N>(query: ComplexSqlQuerySelectorParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, N>): Promise<DebugResult<Array<N>>>;
  extract<N extends Alias<FighterExtract>>(query: ComplexSqlQueryAliasParams<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, N>): Promise<Array<FighterExtract & ReturnTypes<N>>>;
  extract<N extends Alias<FighterExtract>>(query: ComplexSqlQueryAliasParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, N>): Promise<DebugResult<Array<FighterExtract & ReturnTypes<N>>>>;
  extract<U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryIncludeParams<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, U>): Promise<Array<MergeIncludes<FighterExtract, U>>>;
  extract<U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryIncludeParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, U>): Promise<DebugResult<Array<MergeIncludes<FighterExtract, U>>>>;
  extract<U extends Includes<TypedDb, FighterExtract>, N extends Alias<FighterExtract>>(query: ComplexSqlQueryIncludeAliasParams<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, U, N>): Promise<Array<MergeIncludes<FighterExtract, U> & ReturnTypes<N>>>;
  extract<U extends Includes<TypedDb, FighterExtract>, N extends Alias<FighterExtract>>(query: ComplexSqlQueryIncludeAliasParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterExtract, U> & ReturnTypes<N>>>>;
  extract<K extends keyof FighterExtract, N extends Alias<FighterExtract>>(query: ComplexSqlQueryObjectAliasParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, N>): Promise<Array<Pick<FighterExtract, K> & ReturnTypes<N>>>;
  extract<K extends keyof FighterExtract, N extends Alias<FighterExtract>>(query: ComplexSqlQueryObjectAliasParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, N>): Promise<DebugResult<Array<Pick<FighterExtract, K> & ReturnTypes<N>>>>;
  extract<K extends keyof FighterExtract>(query: ComplexSqlQueryObjectParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract>): Promise<Array<Pick<FighterExtract, K>>>;
  extract<K extends keyof FighterExtract>(query: ComplexSqlQueryObjectParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract>): Promise<DebugResult<Array<Pick<FighterExtract, K>>>>;
  extract<K extends keyof FighterExtract>(query: ComplexSqlQueryObjectOmitParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract>): Promise<Array<Omit<FighterExtract, K>>>;
  extract<K extends keyof FighterExtract>(query: ComplexSqlQueryObjectOmitParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract>): Promise<DebugResult<Array<Omit<FighterExtract, K>>>>;
  extract<K extends keyof FighterExtract, N extends Alias<FighterExtract>>(query: ComplexSqlQueryObjectAliasOmitParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, N>): Promise<Array<Omit<FighterExtract, K> & ReturnTypes<N>>>;
  extract<K extends keyof FighterExtract, N extends Alias<FighterExtract>>(query: ComplexSqlQueryObjectAliasOmitParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, N>): Promise<DebugResult<Array<Omit<FighterExtract, K> & ReturnTypes<N>>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryObjectIncludeParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U>): Promise<Array<MergeIncludes<Pick<FighterExtract, K>, U>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryObjectIncludeParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterExtract, K>, U>>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U>): Promise<Array<MergeIncludes<Omit<FighterExtract, K>, U>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterExtract, K>, U>>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>, N extends Alias<FighterExtract>>(query: ComplexSqlQueryObjectIncludeAliasParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U, N>): Promise<Array<MergeIncludes<Pick<FighterExtract, K>, U> & ReturnTypes<N>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>, N extends Alias<FighterExtract>>(query: ComplexSqlQueryObjectIncludeAliasParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterExtract, K>, U> & ReturnTypes<N>>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>, N extends Alias<FighterExtract>>(query: ComplexSqlQueryObjectIncludeAliasOmitParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U, N>): Promise<Array<MergeIncludes<Omit<FighterExtract, K>, U> & ReturnTypes<N>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>, N extends Alias<FighterExtract>>(query: ComplexSqlQueryObjectIncludeAliasOmitParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterExtract, K>, U> & ReturnTypes<N>>>>;
  extract<K extends keyof FighterExtract>(query: ComplexSqlQueryValueParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract>): Promise<Array<FighterExtract[K]>>;
  extract<K extends keyof FighterExtract>(query: ComplexSqlQueryValueParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract>): Promise<DebugResult<Array<FighterExtract[K]>>>;
  extract(query: ComplexSqlQueryParams<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract>): Promise<Array<FighterExtract>>;
  extract(query: ComplexSqlQueryParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract>): Promise<DebugResult<Array<FighterExtract>>>;
  extract<N>(query: ComplexSqlQuerySelectorParams<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, N>): Promise<Array<N>>;
  extract<N>(query: ComplexSqlQuerySelectorParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, N>): Promise<DebugResult<Array<N>>>;
  filter<N extends Alias<FighterFilter>>(query: ComplexSqlQueryAlias<ToWhere<FighterFilter>, FighterFilter, N>): Promise<Array<FighterFilter & ReturnTypes<N>>>;
  filter<N extends Alias<FighterFilter>>(query: ComplexSqlQueryAliasDebug<ToWhere<FighterFilter>, FighterFilter, N>): Promise<DebugResult<Array<FighterFilter & ReturnTypes<N>>>>;
  filter<U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryInclude<ToWhere<FighterFilter>, FighterFilter, U>): Promise<Array<MergeIncludes<FighterFilter, U>>>;
  filter<U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterFilter>, FighterFilter, U>): Promise<DebugResult<Array<MergeIncludes<FighterFilter, U>>>>;
  filter<U extends Includes<TypedDb, FighterFilter>, N extends Alias<FighterFilter>>(query: ComplexSqlQueryIncludeAlias<ToWhere<FighterFilter>, FighterFilter, U, N>): Promise<Array<MergeIncludes<FighterFilter, U> & ReturnTypes<N>>>;
  filter<U extends Includes<TypedDb, FighterFilter>, N extends Alias<FighterFilter>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<FighterFilter>, FighterFilter, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterFilter, U> & ReturnTypes<N>>>>;
  filter<K extends keyof FighterFilter, N extends Alias<FighterFilter>>(query: ComplexSqlQueryObjectAlias<ToWhere<FighterFilter>, K, FighterFilter, N>): Promise<Array<Pick<FighterFilter, K> & ReturnTypes<N>>>;
  filter<K extends keyof FighterFilter, N extends Alias<FighterFilter>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<FighterFilter>, K, FighterFilter, N>): Promise<DebugResult<Array<Pick<FighterFilter, K> & ReturnTypes<N>>>>;
  filter<K extends keyof FighterFilter>(query: ComplexSqlQueryObject<ToWhere<FighterFilter>, K, FighterFilter>): Promise<Array<Pick<FighterFilter, K>>>;
  filter<K extends keyof FighterFilter>(query: ComplexSqlQueryObjectDebug<ToWhere<FighterFilter>, K, FighterFilter>): Promise<DebugResult<Array<Pick<FighterFilter, K>>>>;
  filter<K extends keyof FighterFilter>(query: ComplexSqlQueryObjectOmit<ToWhere<FighterFilter>, K, FighterFilter>): Promise<Array<Omit<FighterFilter, K>>>;
  filter<K extends keyof FighterFilter>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<FighterFilter>, K, FighterFilter>): Promise<DebugResult<Array<Omit<FighterFilter, K>>>>;
  filter<K extends keyof FighterFilter, N extends Alias<FighterFilter>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<FighterFilter>, K, FighterFilter, N>): Promise<Array<Omit<FighterFilter, K> & ReturnTypes<N>>>;
  filter<K extends keyof FighterFilter, N extends Alias<FighterFilter>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<FighterFilter>, K, FighterFilter, N>): Promise<DebugResult<Array<Omit<FighterFilter, K> & ReturnTypes<N>>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterFilter>, K, FighterFilter, U>): Promise<Array<MergeIncludes<Pick<FighterFilter, K>, U>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterFilter>, K, FighterFilter, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterFilter, K>, U>>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterFilter>, K, FighterFilter, U>): Promise<Array<MergeIncludes<Omit<FighterFilter, K>, U>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterFilter>, K, FighterFilter, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterFilter, K>, U>>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>, N extends Alias<FighterFilter>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<FighterFilter>, K, FighterFilter, U, N>): Promise<Array<MergeIncludes<Pick<FighterFilter, K>, U> & ReturnTypes<N>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>, N extends Alias<FighterFilter>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<FighterFilter>, K, FighterFilter, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterFilter, K>, U> & ReturnTypes<N>>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>, N extends Alias<FighterFilter>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<FighterFilter>, K, FighterFilter, U, N>): Promise<Array<MergeIncludes<Omit<FighterFilter, K>, U> & ReturnTypes<N>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>, N extends Alias<FighterFilter>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<FighterFilter>, K, FighterFilter, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterFilter, K>, U> & ReturnTypes<N>>>>;
  filter<K extends keyof FighterFilter>(query: ComplexSqlQueryValue<ToWhere<FighterFilter>, K, FighterFilter>): Promise<Array<FighterFilter[K]>>;
  filter<K extends keyof FighterFilter>(query: ComplexSqlQueryValueDebug<ToWhere<FighterFilter>, K, FighterFilter>): Promise<DebugResult<Array<FighterFilter[K]>>>;
  filter(query: ComplexSqlQuery<ToWhere<FighterFilter>, FighterFilter>): Promise<Array<FighterFilter>>;
  filter(query: ComplexSqlQueryDebug<ToWhere<FighterFilter>, FighterFilter>): Promise<DebugResult<Array<FighterFilter>>>;
  filter<N>(query: ComplexSqlQuerySelector<ToWhere<FighterFilter>, FighterFilter, N>): Promise<Array<N>>;
  filter<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterFilter>, FighterFilter, N>): Promise<DebugResult<Array<N>>>;
  instagram<N extends Alias<FighterInstagram>>(query: ComplexSqlQueryAlias<ToWhere<FighterInstagram>, FighterInstagram, N>): Promise<Array<FighterInstagram & ReturnTypes<N>>>;
  instagram<N extends Alias<FighterInstagram>>(query: ComplexSqlQueryAliasDebug<ToWhere<FighterInstagram>, FighterInstagram, N>): Promise<DebugResult<Array<FighterInstagram & ReturnTypes<N>>>>;
  instagram<U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryInclude<ToWhere<FighterInstagram>, FighterInstagram, U>): Promise<Array<MergeIncludes<FighterInstagram, U>>>;
  instagram<U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterInstagram>, FighterInstagram, U>): Promise<DebugResult<Array<MergeIncludes<FighterInstagram, U>>>>;
  instagram<U extends Includes<TypedDb, FighterInstagram>, N extends Alias<FighterInstagram>>(query: ComplexSqlQueryIncludeAlias<ToWhere<FighterInstagram>, FighterInstagram, U, N>): Promise<Array<MergeIncludes<FighterInstagram, U> & ReturnTypes<N>>>;
  instagram<U extends Includes<TypedDb, FighterInstagram>, N extends Alias<FighterInstagram>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<FighterInstagram>, FighterInstagram, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterInstagram, U> & ReturnTypes<N>>>>;
  instagram<K extends keyof FighterInstagram, N extends Alias<FighterInstagram>>(query: ComplexSqlQueryObjectAlias<ToWhere<FighterInstagram>, K, FighterInstagram, N>): Promise<Array<Pick<FighterInstagram, K> & ReturnTypes<N>>>;
  instagram<K extends keyof FighterInstagram, N extends Alias<FighterInstagram>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<FighterInstagram>, K, FighterInstagram, N>): Promise<DebugResult<Array<Pick<FighterInstagram, K> & ReturnTypes<N>>>>;
  instagram<K extends keyof FighterInstagram>(query: ComplexSqlQueryObject<ToWhere<FighterInstagram>, K, FighterInstagram>): Promise<Array<Pick<FighterInstagram, K>>>;
  instagram<K extends keyof FighterInstagram>(query: ComplexSqlQueryObjectDebug<ToWhere<FighterInstagram>, K, FighterInstagram>): Promise<DebugResult<Array<Pick<FighterInstagram, K>>>>;
  instagram<K extends keyof FighterInstagram>(query: ComplexSqlQueryObjectOmit<ToWhere<FighterInstagram>, K, FighterInstagram>): Promise<Array<Omit<FighterInstagram, K>>>;
  instagram<K extends keyof FighterInstagram>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<FighterInstagram>, K, FighterInstagram>): Promise<DebugResult<Array<Omit<FighterInstagram, K>>>>;
  instagram<K extends keyof FighterInstagram, N extends Alias<FighterInstagram>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<FighterInstagram>, K, FighterInstagram, N>): Promise<Array<Omit<FighterInstagram, K> & ReturnTypes<N>>>;
  instagram<K extends keyof FighterInstagram, N extends Alias<FighterInstagram>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<FighterInstagram>, K, FighterInstagram, N>): Promise<DebugResult<Array<Omit<FighterInstagram, K> & ReturnTypes<N>>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterInstagram>, K, FighterInstagram, U>): Promise<Array<MergeIncludes<Pick<FighterInstagram, K>, U>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterInstagram>, K, FighterInstagram, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterInstagram, K>, U>>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterInstagram>, K, FighterInstagram, U>): Promise<Array<MergeIncludes<Omit<FighterInstagram, K>, U>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterInstagram>, K, FighterInstagram, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterInstagram, K>, U>>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>, N extends Alias<FighterInstagram>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<FighterInstagram>, K, FighterInstagram, U, N>): Promise<Array<MergeIncludes<Pick<FighterInstagram, K>, U> & ReturnTypes<N>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>, N extends Alias<FighterInstagram>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<FighterInstagram>, K, FighterInstagram, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterInstagram, K>, U> & ReturnTypes<N>>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>, N extends Alias<FighterInstagram>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<FighterInstagram>, K, FighterInstagram, U, N>): Promise<Array<MergeIncludes<Omit<FighterInstagram, K>, U> & ReturnTypes<N>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>, N extends Alias<FighterInstagram>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<FighterInstagram>, K, FighterInstagram, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterInstagram, K>, U> & ReturnTypes<N>>>>;
  instagram<K extends keyof FighterInstagram>(query: ComplexSqlQueryValue<ToWhere<FighterInstagram>, K, FighterInstagram>): Promise<Array<FighterInstagram[K]>>;
  instagram<K extends keyof FighterInstagram>(query: ComplexSqlQueryValueDebug<ToWhere<FighterInstagram>, K, FighterInstagram>): Promise<DebugResult<Array<FighterInstagram[K]>>>;
  instagram(query: ComplexSqlQuery<ToWhere<FighterInstagram>, FighterInstagram>): Promise<Array<FighterInstagram>>;
  instagram(query: ComplexSqlQueryDebug<ToWhere<FighterInstagram>, FighterInstagram>): Promise<DebugResult<Array<FighterInstagram>>>;
  instagram<N>(query: ComplexSqlQuerySelector<ToWhere<FighterInstagram>, FighterInstagram, N>): Promise<Array<N>>;
  instagram<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterInstagram>, FighterInstagram, N>): Promise<DebugResult<Array<N>>>;
  lastFights<N extends Alias<FighterLastFights>>(query: ComplexSqlQueryAliasParams<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, N>): Promise<Array<FighterLastFights & ReturnTypes<N>>>;
  lastFights<N extends Alias<FighterLastFights>>(query: ComplexSqlQueryAliasParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, N>): Promise<DebugResult<Array<FighterLastFights & ReturnTypes<N>>>>;
  lastFights<U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryIncludeParams<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, U>): Promise<Array<MergeIncludes<FighterLastFights, U>>>;
  lastFights<U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryIncludeParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, U>): Promise<DebugResult<Array<MergeIncludes<FighterLastFights, U>>>>;
  lastFights<U extends Includes<TypedDb, FighterLastFights>, N extends Alias<FighterLastFights>>(query: ComplexSqlQueryIncludeAliasParams<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, U, N>): Promise<Array<MergeIncludes<FighterLastFights, U> & ReturnTypes<N>>>;
  lastFights<U extends Includes<TypedDb, FighterLastFights>, N extends Alias<FighterLastFights>>(query: ComplexSqlQueryIncludeAliasParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterLastFights, U> & ReturnTypes<N>>>>;
  lastFights<K extends keyof FighterLastFights, N extends Alias<FighterLastFights>>(query: ComplexSqlQueryObjectAliasParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, N>): Promise<Array<Pick<FighterLastFights, K> & ReturnTypes<N>>>;
  lastFights<K extends keyof FighterLastFights, N extends Alias<FighterLastFights>>(query: ComplexSqlQueryObjectAliasParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, N>): Promise<DebugResult<Array<Pick<FighterLastFights, K> & ReturnTypes<N>>>>;
  lastFights<K extends keyof FighterLastFights>(query: ComplexSqlQueryObjectParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights>): Promise<Array<Pick<FighterLastFights, K>>>;
  lastFights<K extends keyof FighterLastFights>(query: ComplexSqlQueryObjectParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights>): Promise<DebugResult<Array<Pick<FighterLastFights, K>>>>;
  lastFights<K extends keyof FighterLastFights>(query: ComplexSqlQueryObjectOmitParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights>): Promise<Array<Omit<FighterLastFights, K>>>;
  lastFights<K extends keyof FighterLastFights>(query: ComplexSqlQueryObjectOmitParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights>): Promise<DebugResult<Array<Omit<FighterLastFights, K>>>>;
  lastFights<K extends keyof FighterLastFights, N extends Alias<FighterLastFights>>(query: ComplexSqlQueryObjectAliasOmitParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, N>): Promise<Array<Omit<FighterLastFights, K> & ReturnTypes<N>>>;
  lastFights<K extends keyof FighterLastFights, N extends Alias<FighterLastFights>>(query: ComplexSqlQueryObjectAliasOmitParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, N>): Promise<DebugResult<Array<Omit<FighterLastFights, K> & ReturnTypes<N>>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryObjectIncludeParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U>): Promise<Array<MergeIncludes<Pick<FighterLastFights, K>, U>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryObjectIncludeParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterLastFights, K>, U>>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U>): Promise<Array<MergeIncludes<Omit<FighterLastFights, K>, U>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterLastFights, K>, U>>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>, N extends Alias<FighterLastFights>>(query: ComplexSqlQueryObjectIncludeAliasParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U, N>): Promise<Array<MergeIncludes<Pick<FighterLastFights, K>, U> & ReturnTypes<N>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>, N extends Alias<FighterLastFights>>(query: ComplexSqlQueryObjectIncludeAliasParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterLastFights, K>, U> & ReturnTypes<N>>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>, N extends Alias<FighterLastFights>>(query: ComplexSqlQueryObjectIncludeAliasOmitParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U, N>): Promise<Array<MergeIncludes<Omit<FighterLastFights, K>, U> & ReturnTypes<N>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>, N extends Alias<FighterLastFights>>(query: ComplexSqlQueryObjectIncludeAliasOmitParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterLastFights, K>, U> & ReturnTypes<N>>>>;
  lastFights<K extends keyof FighterLastFights>(query: ComplexSqlQueryValueParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights>): Promise<Array<FighterLastFights[K]>>;
  lastFights<K extends keyof FighterLastFights>(query: ComplexSqlQueryValueParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights>): Promise<DebugResult<Array<FighterLastFights[K]>>>;
  lastFights(query: ComplexSqlQueryParams<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights>): Promise<Array<FighterLastFights>>;
  lastFights(query: ComplexSqlQueryParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights>): Promise<DebugResult<Array<FighterLastFights>>>;
  lastFights<N>(query: ComplexSqlQuerySelectorParams<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, N>): Promise<Array<N>>;
  lastFights<N>(query: ComplexSqlQuerySelectorParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, N>): Promise<DebugResult<Array<N>>>;
  left<N extends Alias<FighterLeft>>(query: ComplexSqlQueryAlias<ToWhere<FighterLeft>, FighterLeft, N>): Promise<Array<FighterLeft & ReturnTypes<N>>>;
  left<N extends Alias<FighterLeft>>(query: ComplexSqlQueryAliasDebug<ToWhere<FighterLeft>, FighterLeft, N>): Promise<DebugResult<Array<FighterLeft & ReturnTypes<N>>>>;
  left<U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryInclude<ToWhere<FighterLeft>, FighterLeft, U>): Promise<Array<MergeIncludes<FighterLeft, U>>>;
  left<U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterLeft>, FighterLeft, U>): Promise<DebugResult<Array<MergeIncludes<FighterLeft, U>>>>;
  left<U extends Includes<TypedDb, FighterLeft>, N extends Alias<FighterLeft>>(query: ComplexSqlQueryIncludeAlias<ToWhere<FighterLeft>, FighterLeft, U, N>): Promise<Array<MergeIncludes<FighterLeft, U> & ReturnTypes<N>>>;
  left<U extends Includes<TypedDb, FighterLeft>, N extends Alias<FighterLeft>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<FighterLeft>, FighterLeft, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterLeft, U> & ReturnTypes<N>>>>;
  left<K extends keyof FighterLeft, N extends Alias<FighterLeft>>(query: ComplexSqlQueryObjectAlias<ToWhere<FighterLeft>, K, FighterLeft, N>): Promise<Array<Pick<FighterLeft, K> & ReturnTypes<N>>>;
  left<K extends keyof FighterLeft, N extends Alias<FighterLeft>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<FighterLeft>, K, FighterLeft, N>): Promise<DebugResult<Array<Pick<FighterLeft, K> & ReturnTypes<N>>>>;
  left<K extends keyof FighterLeft>(query: ComplexSqlQueryObject<ToWhere<FighterLeft>, K, FighterLeft>): Promise<Array<Pick<FighterLeft, K>>>;
  left<K extends keyof FighterLeft>(query: ComplexSqlQueryObjectDebug<ToWhere<FighterLeft>, K, FighterLeft>): Promise<DebugResult<Array<Pick<FighterLeft, K>>>>;
  left<K extends keyof FighterLeft>(query: ComplexSqlQueryObjectOmit<ToWhere<FighterLeft>, K, FighterLeft>): Promise<Array<Omit<FighterLeft, K>>>;
  left<K extends keyof FighterLeft>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<FighterLeft>, K, FighterLeft>): Promise<DebugResult<Array<Omit<FighterLeft, K>>>>;
  left<K extends keyof FighterLeft, N extends Alias<FighterLeft>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<FighterLeft>, K, FighterLeft, N>): Promise<Array<Omit<FighterLeft, K> & ReturnTypes<N>>>;
  left<K extends keyof FighterLeft, N extends Alias<FighterLeft>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<FighterLeft>, K, FighterLeft, N>): Promise<DebugResult<Array<Omit<FighterLeft, K> & ReturnTypes<N>>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterLeft>, K, FighterLeft, U>): Promise<Array<MergeIncludes<Pick<FighterLeft, K>, U>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterLeft>, K, FighterLeft, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterLeft, K>, U>>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterLeft>, K, FighterLeft, U>): Promise<Array<MergeIncludes<Omit<FighterLeft, K>, U>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterLeft>, K, FighterLeft, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterLeft, K>, U>>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>, N extends Alias<FighterLeft>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<FighterLeft>, K, FighterLeft, U, N>): Promise<Array<MergeIncludes<Pick<FighterLeft, K>, U> & ReturnTypes<N>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>, N extends Alias<FighterLeft>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<FighterLeft>, K, FighterLeft, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterLeft, K>, U> & ReturnTypes<N>>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>, N extends Alias<FighterLeft>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<FighterLeft>, K, FighterLeft, U, N>): Promise<Array<MergeIncludes<Omit<FighterLeft, K>, U> & ReturnTypes<N>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>, N extends Alias<FighterLeft>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<FighterLeft>, K, FighterLeft, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterLeft, K>, U> & ReturnTypes<N>>>>;
  left<K extends keyof FighterLeft>(query: ComplexSqlQueryValue<ToWhere<FighterLeft>, K, FighterLeft>): Promise<Array<FighterLeft[K]>>;
  left<K extends keyof FighterLeft>(query: ComplexSqlQueryValueDebug<ToWhere<FighterLeft>, K, FighterLeft>): Promise<DebugResult<Array<FighterLeft[K]>>>;
  left(query: ComplexSqlQuery<ToWhere<FighterLeft>, FighterLeft>): Promise<Array<FighterLeft>>;
  left(query: ComplexSqlQueryDebug<ToWhere<FighterLeft>, FighterLeft>): Promise<DebugResult<Array<FighterLeft>>>;
  left<N>(query: ComplexSqlQuerySelector<ToWhere<FighterLeft>, FighterLeft, N>): Promise<Array<N>>;
  left<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterLeft>, FighterLeft, N>): Promise<DebugResult<Array<N>>>;
  methods<N extends Alias<FighterMethods>>(query: ComplexSqlQueryAliasParams<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, N>): Promise<Array<FighterMethods & ReturnTypes<N>>>;
  methods<N extends Alias<FighterMethods>>(query: ComplexSqlQueryAliasParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, N>): Promise<DebugResult<Array<FighterMethods & ReturnTypes<N>>>>;
  methods<U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryIncludeParams<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, U>): Promise<Array<MergeIncludes<FighterMethods, U>>>;
  methods<U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryIncludeParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, U>): Promise<DebugResult<Array<MergeIncludes<FighterMethods, U>>>>;
  methods<U extends Includes<TypedDb, FighterMethods>, N extends Alias<FighterMethods>>(query: ComplexSqlQueryIncludeAliasParams<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, U, N>): Promise<Array<MergeIncludes<FighterMethods, U> & ReturnTypes<N>>>;
  methods<U extends Includes<TypedDb, FighterMethods>, N extends Alias<FighterMethods>>(query: ComplexSqlQueryIncludeAliasParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterMethods, U> & ReturnTypes<N>>>>;
  methods<K extends keyof FighterMethods, N extends Alias<FighterMethods>>(query: ComplexSqlQueryObjectAliasParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, N>): Promise<Array<Pick<FighterMethods, K> & ReturnTypes<N>>>;
  methods<K extends keyof FighterMethods, N extends Alias<FighterMethods>>(query: ComplexSqlQueryObjectAliasParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, N>): Promise<DebugResult<Array<Pick<FighterMethods, K> & ReturnTypes<N>>>>;
  methods<K extends keyof FighterMethods>(query: ComplexSqlQueryObjectParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods>): Promise<Array<Pick<FighterMethods, K>>>;
  methods<K extends keyof FighterMethods>(query: ComplexSqlQueryObjectParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods>): Promise<DebugResult<Array<Pick<FighterMethods, K>>>>;
  methods<K extends keyof FighterMethods>(query: ComplexSqlQueryObjectOmitParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods>): Promise<Array<Omit<FighterMethods, K>>>;
  methods<K extends keyof FighterMethods>(query: ComplexSqlQueryObjectOmitParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods>): Promise<DebugResult<Array<Omit<FighterMethods, K>>>>;
  methods<K extends keyof FighterMethods, N extends Alias<FighterMethods>>(query: ComplexSqlQueryObjectAliasOmitParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, N>): Promise<Array<Omit<FighterMethods, K> & ReturnTypes<N>>>;
  methods<K extends keyof FighterMethods, N extends Alias<FighterMethods>>(query: ComplexSqlQueryObjectAliasOmitParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, N>): Promise<DebugResult<Array<Omit<FighterMethods, K> & ReturnTypes<N>>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryObjectIncludeParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U>): Promise<Array<MergeIncludes<Pick<FighterMethods, K>, U>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryObjectIncludeParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterMethods, K>, U>>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U>): Promise<Array<MergeIncludes<Omit<FighterMethods, K>, U>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterMethods, K>, U>>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>, N extends Alias<FighterMethods>>(query: ComplexSqlQueryObjectIncludeAliasParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U, N>): Promise<Array<MergeIncludes<Pick<FighterMethods, K>, U> & ReturnTypes<N>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>, N extends Alias<FighterMethods>>(query: ComplexSqlQueryObjectIncludeAliasParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterMethods, K>, U> & ReturnTypes<N>>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>, N extends Alias<FighterMethods>>(query: ComplexSqlQueryObjectIncludeAliasOmitParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U, N>): Promise<Array<MergeIncludes<Omit<FighterMethods, K>, U> & ReturnTypes<N>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>, N extends Alias<FighterMethods>>(query: ComplexSqlQueryObjectIncludeAliasOmitParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterMethods, K>, U> & ReturnTypes<N>>>>;
  methods<K extends keyof FighterMethods>(query: ComplexSqlQueryValueParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods>): Promise<Array<FighterMethods[K]>>;
  methods<K extends keyof FighterMethods>(query: ComplexSqlQueryValueParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods>): Promise<DebugResult<Array<FighterMethods[K]>>>;
  methods(query: ComplexSqlQueryParams<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods>): Promise<Array<FighterMethods>>;
  methods(query: ComplexSqlQueryParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods>): Promise<DebugResult<Array<FighterMethods>>>;
  methods<N>(query: ComplexSqlQuerySelectorParams<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, N>): Promise<Array<N>>;
  methods<N>(query: ComplexSqlQuerySelectorParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, N>): Promise<DebugResult<Array<N>>>;
  opponents<N extends Alias<FighterOpponents>>(query: ComplexSqlQueryAlias<ToWhere<FighterOpponents>, FighterOpponents, N>): Promise<Array<FighterOpponents & ReturnTypes<N>>>;
  opponents<N extends Alias<FighterOpponents>>(query: ComplexSqlQueryAliasDebug<ToWhere<FighterOpponents>, FighterOpponents, N>): Promise<DebugResult<Array<FighterOpponents & ReturnTypes<N>>>>;
  opponents<U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryInclude<ToWhere<FighterOpponents>, FighterOpponents, U>): Promise<Array<MergeIncludes<FighterOpponents, U>>>;
  opponents<U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterOpponents>, FighterOpponents, U>): Promise<DebugResult<Array<MergeIncludes<FighterOpponents, U>>>>;
  opponents<U extends Includes<TypedDb, FighterOpponents>, N extends Alias<FighterOpponents>>(query: ComplexSqlQueryIncludeAlias<ToWhere<FighterOpponents>, FighterOpponents, U, N>): Promise<Array<MergeIncludes<FighterOpponents, U> & ReturnTypes<N>>>;
  opponents<U extends Includes<TypedDb, FighterOpponents>, N extends Alias<FighterOpponents>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<FighterOpponents>, FighterOpponents, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterOpponents, U> & ReturnTypes<N>>>>;
  opponents<K extends keyof FighterOpponents, N extends Alias<FighterOpponents>>(query: ComplexSqlQueryObjectAlias<ToWhere<FighterOpponents>, K, FighterOpponents, N>): Promise<Array<Pick<FighterOpponents, K> & ReturnTypes<N>>>;
  opponents<K extends keyof FighterOpponents, N extends Alias<FighterOpponents>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<FighterOpponents>, K, FighterOpponents, N>): Promise<DebugResult<Array<Pick<FighterOpponents, K> & ReturnTypes<N>>>>;
  opponents<K extends keyof FighterOpponents>(query: ComplexSqlQueryObject<ToWhere<FighterOpponents>, K, FighterOpponents>): Promise<Array<Pick<FighterOpponents, K>>>;
  opponents<K extends keyof FighterOpponents>(query: ComplexSqlQueryObjectDebug<ToWhere<FighterOpponents>, K, FighterOpponents>): Promise<DebugResult<Array<Pick<FighterOpponents, K>>>>;
  opponents<K extends keyof FighterOpponents>(query: ComplexSqlQueryObjectOmit<ToWhere<FighterOpponents>, K, FighterOpponents>): Promise<Array<Omit<FighterOpponents, K>>>;
  opponents<K extends keyof FighterOpponents>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<FighterOpponents>, K, FighterOpponents>): Promise<DebugResult<Array<Omit<FighterOpponents, K>>>>;
  opponents<K extends keyof FighterOpponents, N extends Alias<FighterOpponents>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<FighterOpponents>, K, FighterOpponents, N>): Promise<Array<Omit<FighterOpponents, K> & ReturnTypes<N>>>;
  opponents<K extends keyof FighterOpponents, N extends Alias<FighterOpponents>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<FighterOpponents>, K, FighterOpponents, N>): Promise<DebugResult<Array<Omit<FighterOpponents, K> & ReturnTypes<N>>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterOpponents>, K, FighterOpponents, U>): Promise<Array<MergeIncludes<Pick<FighterOpponents, K>, U>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterOpponents>, K, FighterOpponents, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterOpponents, K>, U>>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterOpponents>, K, FighterOpponents, U>): Promise<Array<MergeIncludes<Omit<FighterOpponents, K>, U>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterOpponents>, K, FighterOpponents, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterOpponents, K>, U>>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>, N extends Alias<FighterOpponents>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<FighterOpponents>, K, FighterOpponents, U, N>): Promise<Array<MergeIncludes<Pick<FighterOpponents, K>, U> & ReturnTypes<N>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>, N extends Alias<FighterOpponents>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<FighterOpponents>, K, FighterOpponents, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterOpponents, K>, U> & ReturnTypes<N>>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>, N extends Alias<FighterOpponents>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<FighterOpponents>, K, FighterOpponents, U, N>): Promise<Array<MergeIncludes<Omit<FighterOpponents, K>, U> & ReturnTypes<N>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>, N extends Alias<FighterOpponents>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<FighterOpponents>, K, FighterOpponents, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterOpponents, K>, U> & ReturnTypes<N>>>>;
  opponents<K extends keyof FighterOpponents>(query: ComplexSqlQueryValue<ToWhere<FighterOpponents>, K, FighterOpponents>): Promise<Array<FighterOpponents[K]>>;
  opponents<K extends keyof FighterOpponents>(query: ComplexSqlQueryValueDebug<ToWhere<FighterOpponents>, K, FighterOpponents>): Promise<DebugResult<Array<FighterOpponents[K]>>>;
  opponents(query: ComplexSqlQuery<ToWhere<FighterOpponents>, FighterOpponents>): Promise<Array<FighterOpponents>>;
  opponents(query: ComplexSqlQueryDebug<ToWhere<FighterOpponents>, FighterOpponents>): Promise<DebugResult<Array<FighterOpponents>>>;
  opponents<N>(query: ComplexSqlQuerySelector<ToWhere<FighterOpponents>, FighterOpponents, N>): Promise<Array<N>>;
  opponents<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterOpponents>, FighterOpponents, N>): Promise<DebugResult<Array<N>>>;
  otherNames<N extends Alias<FighterOtherNames>>(query: ComplexSqlQueryAlias<ToWhere<FighterOtherNames>, FighterOtherNames, N>): Promise<Array<FighterOtherNames & ReturnTypes<N>>>;
  otherNames<N extends Alias<FighterOtherNames>>(query: ComplexSqlQueryAliasDebug<ToWhere<FighterOtherNames>, FighterOtherNames, N>): Promise<DebugResult<Array<FighterOtherNames & ReturnTypes<N>>>>;
  otherNames<U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryInclude<ToWhere<FighterOtherNames>, FighterOtherNames, U>): Promise<Array<MergeIncludes<FighterOtherNames, U>>>;
  otherNames<U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterOtherNames>, FighterOtherNames, U>): Promise<DebugResult<Array<MergeIncludes<FighterOtherNames, U>>>>;
  otherNames<U extends Includes<TypedDb, FighterOtherNames>, N extends Alias<FighterOtherNames>>(query: ComplexSqlQueryIncludeAlias<ToWhere<FighterOtherNames>, FighterOtherNames, U, N>): Promise<Array<MergeIncludes<FighterOtherNames, U> & ReturnTypes<N>>>;
  otherNames<U extends Includes<TypedDb, FighterOtherNames>, N extends Alias<FighterOtherNames>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<FighterOtherNames>, FighterOtherNames, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterOtherNames, U> & ReturnTypes<N>>>>;
  otherNames<K extends keyof FighterOtherNames, N extends Alias<FighterOtherNames>>(query: ComplexSqlQueryObjectAlias<ToWhere<FighterOtherNames>, K, FighterOtherNames, N>): Promise<Array<Pick<FighterOtherNames, K> & ReturnTypes<N>>>;
  otherNames<K extends keyof FighterOtherNames, N extends Alias<FighterOtherNames>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<FighterOtherNames>, K, FighterOtherNames, N>): Promise<DebugResult<Array<Pick<FighterOtherNames, K> & ReturnTypes<N>>>>;
  otherNames<K extends keyof FighterOtherNames>(query: ComplexSqlQueryObject<ToWhere<FighterOtherNames>, K, FighterOtherNames>): Promise<Array<Pick<FighterOtherNames, K>>>;
  otherNames<K extends keyof FighterOtherNames>(query: ComplexSqlQueryObjectDebug<ToWhere<FighterOtherNames>, K, FighterOtherNames>): Promise<DebugResult<Array<Pick<FighterOtherNames, K>>>>;
  otherNames<K extends keyof FighterOtherNames>(query: ComplexSqlQueryObjectOmit<ToWhere<FighterOtherNames>, K, FighterOtherNames>): Promise<Array<Omit<FighterOtherNames, K>>>;
  otherNames<K extends keyof FighterOtherNames>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<FighterOtherNames>, K, FighterOtherNames>): Promise<DebugResult<Array<Omit<FighterOtherNames, K>>>>;
  otherNames<K extends keyof FighterOtherNames, N extends Alias<FighterOtherNames>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<FighterOtherNames>, K, FighterOtherNames, N>): Promise<Array<Omit<FighterOtherNames, K> & ReturnTypes<N>>>;
  otherNames<K extends keyof FighterOtherNames, N extends Alias<FighterOtherNames>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<FighterOtherNames>, K, FighterOtherNames, N>): Promise<DebugResult<Array<Omit<FighterOtherNames, K> & ReturnTypes<N>>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterOtherNames>, K, FighterOtherNames, U>): Promise<Array<MergeIncludes<Pick<FighterOtherNames, K>, U>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterOtherNames>, K, FighterOtherNames, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterOtherNames, K>, U>>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterOtherNames>, K, FighterOtherNames, U>): Promise<Array<MergeIncludes<Omit<FighterOtherNames, K>, U>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterOtherNames>, K, FighterOtherNames, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterOtherNames, K>, U>>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>, N extends Alias<FighterOtherNames>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<FighterOtherNames>, K, FighterOtherNames, U, N>): Promise<Array<MergeIncludes<Pick<FighterOtherNames, K>, U> & ReturnTypes<N>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>, N extends Alias<FighterOtherNames>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<FighterOtherNames>, K, FighterOtherNames, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterOtherNames, K>, U> & ReturnTypes<N>>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>, N extends Alias<FighterOtherNames>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<FighterOtherNames>, K, FighterOtherNames, U, N>): Promise<Array<MergeIncludes<Omit<FighterOtherNames, K>, U> & ReturnTypes<N>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>, N extends Alias<FighterOtherNames>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<FighterOtherNames>, K, FighterOtherNames, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterOtherNames, K>, U> & ReturnTypes<N>>>>;
  otherNames<K extends keyof FighterOtherNames>(query: ComplexSqlQueryValue<ToWhere<FighterOtherNames>, K, FighterOtherNames>): Promise<Array<FighterOtherNames[K]>>;
  otherNames<K extends keyof FighterOtherNames>(query: ComplexSqlQueryValueDebug<ToWhere<FighterOtherNames>, K, FighterOtherNames>): Promise<DebugResult<Array<FighterOtherNames[K]>>>;
  otherNames(query: ComplexSqlQuery<ToWhere<FighterOtherNames>, FighterOtherNames>): Promise<Array<FighterOtherNames>>;
  otherNames(query: ComplexSqlQueryDebug<ToWhere<FighterOtherNames>, FighterOtherNames>): Promise<DebugResult<Array<FighterOtherNames>>>;
  otherNames<N>(query: ComplexSqlQuerySelector<ToWhere<FighterOtherNames>, FighterOtherNames, N>): Promise<Array<N>>;
  otherNames<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterOtherNames>, FighterOtherNames, N>): Promise<DebugResult<Array<N>>>;
  right<N extends Alias<FighterRight>>(query: ComplexSqlQueryAlias<ToWhere<FighterRight>, FighterRight, N>): Promise<Array<FighterRight & ReturnTypes<N>>>;
  right<N extends Alias<FighterRight>>(query: ComplexSqlQueryAliasDebug<ToWhere<FighterRight>, FighterRight, N>): Promise<DebugResult<Array<FighterRight & ReturnTypes<N>>>>;
  right<U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryInclude<ToWhere<FighterRight>, FighterRight, U>): Promise<Array<MergeIncludes<FighterRight, U>>>;
  right<U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterRight>, FighterRight, U>): Promise<DebugResult<Array<MergeIncludes<FighterRight, U>>>>;
  right<U extends Includes<TypedDb, FighterRight>, N extends Alias<FighterRight>>(query: ComplexSqlQueryIncludeAlias<ToWhere<FighterRight>, FighterRight, U, N>): Promise<Array<MergeIncludes<FighterRight, U> & ReturnTypes<N>>>;
  right<U extends Includes<TypedDb, FighterRight>, N extends Alias<FighterRight>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<FighterRight>, FighterRight, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterRight, U> & ReturnTypes<N>>>>;
  right<K extends keyof FighterRight, N extends Alias<FighterRight>>(query: ComplexSqlQueryObjectAlias<ToWhere<FighterRight>, K, FighterRight, N>): Promise<Array<Pick<FighterRight, K> & ReturnTypes<N>>>;
  right<K extends keyof FighterRight, N extends Alias<FighterRight>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<FighterRight>, K, FighterRight, N>): Promise<DebugResult<Array<Pick<FighterRight, K> & ReturnTypes<N>>>>;
  right<K extends keyof FighterRight>(query: ComplexSqlQueryObject<ToWhere<FighterRight>, K, FighterRight>): Promise<Array<Pick<FighterRight, K>>>;
  right<K extends keyof FighterRight>(query: ComplexSqlQueryObjectDebug<ToWhere<FighterRight>, K, FighterRight>): Promise<DebugResult<Array<Pick<FighterRight, K>>>>;
  right<K extends keyof FighterRight>(query: ComplexSqlQueryObjectOmit<ToWhere<FighterRight>, K, FighterRight>): Promise<Array<Omit<FighterRight, K>>>;
  right<K extends keyof FighterRight>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<FighterRight>, K, FighterRight>): Promise<DebugResult<Array<Omit<FighterRight, K>>>>;
  right<K extends keyof FighterRight, N extends Alias<FighterRight>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<FighterRight>, K, FighterRight, N>): Promise<Array<Omit<FighterRight, K> & ReturnTypes<N>>>;
  right<K extends keyof FighterRight, N extends Alias<FighterRight>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<FighterRight>, K, FighterRight, N>): Promise<DebugResult<Array<Omit<FighterRight, K> & ReturnTypes<N>>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterRight>, K, FighterRight, U>): Promise<Array<MergeIncludes<Pick<FighterRight, K>, U>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterRight>, K, FighterRight, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterRight, K>, U>>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterRight>, K, FighterRight, U>): Promise<Array<MergeIncludes<Omit<FighterRight, K>, U>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterRight>, K, FighterRight, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterRight, K>, U>>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>, N extends Alias<FighterRight>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<FighterRight>, K, FighterRight, U, N>): Promise<Array<MergeIncludes<Pick<FighterRight, K>, U> & ReturnTypes<N>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>, N extends Alias<FighterRight>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<FighterRight>, K, FighterRight, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterRight, K>, U> & ReturnTypes<N>>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>, N extends Alias<FighterRight>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<FighterRight>, K, FighterRight, U, N>): Promise<Array<MergeIncludes<Omit<FighterRight, K>, U> & ReturnTypes<N>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>, N extends Alias<FighterRight>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<FighterRight>, K, FighterRight, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterRight, K>, U> & ReturnTypes<N>>>>;
  right<K extends keyof FighterRight>(query: ComplexSqlQueryValue<ToWhere<FighterRight>, K, FighterRight>): Promise<Array<FighterRight[K]>>;
  right<K extends keyof FighterRight>(query: ComplexSqlQueryValueDebug<ToWhere<FighterRight>, K, FighterRight>): Promise<DebugResult<Array<FighterRight[K]>>>;
  right(query: ComplexSqlQuery<ToWhere<FighterRight>, FighterRight>): Promise<Array<FighterRight>>;
  right(query: ComplexSqlQueryDebug<ToWhere<FighterRight>, FighterRight>): Promise<DebugResult<Array<FighterRight>>>;
  right<N>(query: ComplexSqlQuerySelector<ToWhere<FighterRight>, FighterRight, N>): Promise<Array<N>>;
  right<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterRight>, FighterRight, N>): Promise<DebugResult<Array<N>>>;
  weightClasses<N extends Alias<FighterWeightClasses>>(query: ComplexSqlQueryAliasParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, N>): Promise<Array<FighterWeightClasses & ReturnTypes<N>>>;
  weightClasses<N extends Alias<FighterWeightClasses>>(query: ComplexSqlQueryAliasParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, N>): Promise<DebugResult<Array<FighterWeightClasses & ReturnTypes<N>>>>;
  weightClasses<U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryIncludeParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, U>): Promise<Array<MergeIncludes<FighterWeightClasses, U>>>;
  weightClasses<U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryIncludeParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, U>): Promise<DebugResult<Array<MergeIncludes<FighterWeightClasses, U>>>>;
  weightClasses<U extends Includes<TypedDb, FighterWeightClasses>, N extends Alias<FighterWeightClasses>>(query: ComplexSqlQueryIncludeAliasParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, U, N>): Promise<Array<MergeIncludes<FighterWeightClasses, U> & ReturnTypes<N>>>;
  weightClasses<U extends Includes<TypedDb, FighterWeightClasses>, N extends Alias<FighterWeightClasses>>(query: ComplexSqlQueryIncludeAliasParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterWeightClasses, U> & ReturnTypes<N>>>>;
  weightClasses<K extends keyof FighterWeightClasses, N extends Alias<FighterWeightClasses>>(query: ComplexSqlQueryObjectAliasParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, N>): Promise<Array<Pick<FighterWeightClasses, K> & ReturnTypes<N>>>;
  weightClasses<K extends keyof FighterWeightClasses, N extends Alias<FighterWeightClasses>>(query: ComplexSqlQueryObjectAliasParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, N>): Promise<DebugResult<Array<Pick<FighterWeightClasses, K> & ReturnTypes<N>>>>;
  weightClasses<K extends keyof FighterWeightClasses>(query: ComplexSqlQueryObjectParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses>): Promise<Array<Pick<FighterWeightClasses, K>>>;
  weightClasses<K extends keyof FighterWeightClasses>(query: ComplexSqlQueryObjectParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses>): Promise<DebugResult<Array<Pick<FighterWeightClasses, K>>>>;
  weightClasses<K extends keyof FighterWeightClasses>(query: ComplexSqlQueryObjectOmitParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses>): Promise<Array<Omit<FighterWeightClasses, K>>>;
  weightClasses<K extends keyof FighterWeightClasses>(query: ComplexSqlQueryObjectOmitParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses>): Promise<DebugResult<Array<Omit<FighterWeightClasses, K>>>>;
  weightClasses<K extends keyof FighterWeightClasses, N extends Alias<FighterWeightClasses>>(query: ComplexSqlQueryObjectAliasOmitParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, N>): Promise<Array<Omit<FighterWeightClasses, K> & ReturnTypes<N>>>;
  weightClasses<K extends keyof FighterWeightClasses, N extends Alias<FighterWeightClasses>>(query: ComplexSqlQueryObjectAliasOmitParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, N>): Promise<DebugResult<Array<Omit<FighterWeightClasses, K> & ReturnTypes<N>>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U>): Promise<Array<MergeIncludes<Pick<FighterWeightClasses, K>, U>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterWeightClasses, K>, U>>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U>): Promise<Array<MergeIncludes<Omit<FighterWeightClasses, K>, U>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterWeightClasses, K>, U>>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>, N extends Alias<FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeAliasParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U, N>): Promise<Array<MergeIncludes<Pick<FighterWeightClasses, K>, U> & ReturnTypes<N>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>, N extends Alias<FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeAliasParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterWeightClasses, K>, U> & ReturnTypes<N>>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>, N extends Alias<FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeAliasOmitParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U, N>): Promise<Array<MergeIncludes<Omit<FighterWeightClasses, K>, U> & ReturnTypes<N>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>, N extends Alias<FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeAliasOmitParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterWeightClasses, K>, U> & ReturnTypes<N>>>>;
  weightClasses<K extends keyof FighterWeightClasses>(query: ComplexSqlQueryValueParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses>): Promise<Array<FighterWeightClasses[K]>>;
  weightClasses<K extends keyof FighterWeightClasses>(query: ComplexSqlQueryValueParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses>): Promise<DebugResult<Array<FighterWeightClasses[K]>>>;
  weightClasses(query: ComplexSqlQueryParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses>): Promise<Array<FighterWeightClasses>>;
  weightClasses(query: ComplexSqlQueryParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses>): Promise<DebugResult<Array<FighterWeightClasses>>>;
  weightClasses<N>(query: ComplexSqlQuerySelectorParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, N>): Promise<Array<N>>;
  weightClasses<N>(query: ComplexSqlQuerySelectorParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, N>): Promise<DebugResult<Array<N>>>;
  withReach<N extends Alias<FighterWithReach>>(query: ComplexSqlQueryAlias<ToWhere<FighterWithReach>, FighterWithReach, N>): Promise<Array<FighterWithReach & ReturnTypes<N>>>;
  withReach<N extends Alias<FighterWithReach>>(query: ComplexSqlQueryAliasDebug<ToWhere<FighterWithReach>, FighterWithReach, N>): Promise<DebugResult<Array<FighterWithReach & ReturnTypes<N>>>>;
  withReach<U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryInclude<ToWhere<FighterWithReach>, FighterWithReach, U>): Promise<Array<MergeIncludes<FighterWithReach, U>>>;
  withReach<U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterWithReach>, FighterWithReach, U>): Promise<DebugResult<Array<MergeIncludes<FighterWithReach, U>>>>;
  withReach<U extends Includes<TypedDb, FighterWithReach>, N extends Alias<FighterWithReach>>(query: ComplexSqlQueryIncludeAlias<ToWhere<FighterWithReach>, FighterWithReach, U, N>): Promise<Array<MergeIncludes<FighterWithReach, U> & ReturnTypes<N>>>;
  withReach<U extends Includes<TypedDb, FighterWithReach>, N extends Alias<FighterWithReach>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<FighterWithReach>, FighterWithReach, U, N>): Promise<DebugResult<Array<MergeIncludes<FighterWithReach, U> & ReturnTypes<N>>>>;
  withReach<K extends keyof FighterWithReach, N extends Alias<FighterWithReach>>(query: ComplexSqlQueryObjectAlias<ToWhere<FighterWithReach>, K, FighterWithReach, N>): Promise<Array<Pick<FighterWithReach, K> & ReturnTypes<N>>>;
  withReach<K extends keyof FighterWithReach, N extends Alias<FighterWithReach>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<FighterWithReach>, K, FighterWithReach, N>): Promise<DebugResult<Array<Pick<FighterWithReach, K> & ReturnTypes<N>>>>;
  withReach<K extends keyof FighterWithReach>(query: ComplexSqlQueryObject<ToWhere<FighterWithReach>, K, FighterWithReach>): Promise<Array<Pick<FighterWithReach, K>>>;
  withReach<K extends keyof FighterWithReach>(query: ComplexSqlQueryObjectDebug<ToWhere<FighterWithReach>, K, FighterWithReach>): Promise<DebugResult<Array<Pick<FighterWithReach, K>>>>;
  withReach<K extends keyof FighterWithReach>(query: ComplexSqlQueryObjectOmit<ToWhere<FighterWithReach>, K, FighterWithReach>): Promise<Array<Omit<FighterWithReach, K>>>;
  withReach<K extends keyof FighterWithReach>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<FighterWithReach>, K, FighterWithReach>): Promise<DebugResult<Array<Omit<FighterWithReach, K>>>>;
  withReach<K extends keyof FighterWithReach, N extends Alias<FighterWithReach>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<FighterWithReach>, K, FighterWithReach, N>): Promise<Array<Omit<FighterWithReach, K> & ReturnTypes<N>>>;
  withReach<K extends keyof FighterWithReach, N extends Alias<FighterWithReach>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<FighterWithReach>, K, FighterWithReach, N>): Promise<DebugResult<Array<Omit<FighterWithReach, K> & ReturnTypes<N>>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterWithReach>, K, FighterWithReach, U>): Promise<Array<MergeIncludes<Pick<FighterWithReach, K>, U>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterWithReach>, K, FighterWithReach, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterWithReach, K>, U>>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterWithReach>, K, FighterWithReach, U>): Promise<Array<MergeIncludes<Omit<FighterWithReach, K>, U>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterWithReach>, K, FighterWithReach, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterWithReach, K>, U>>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>, N extends Alias<FighterWithReach>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<FighterWithReach>, K, FighterWithReach, U, N>): Promise<Array<MergeIncludes<Pick<FighterWithReach, K>, U> & ReturnTypes<N>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>, N extends Alias<FighterWithReach>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<FighterWithReach>, K, FighterWithReach, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterWithReach, K>, U> & ReturnTypes<N>>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>, N extends Alias<FighterWithReach>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<FighterWithReach>, K, FighterWithReach, U, N>): Promise<Array<MergeIncludes<Omit<FighterWithReach, K>, U> & ReturnTypes<N>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>, N extends Alias<FighterWithReach>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<FighterWithReach>, K, FighterWithReach, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterWithReach, K>, U> & ReturnTypes<N>>>>;
  withReach<K extends keyof FighterWithReach>(query: ComplexSqlQueryValue<ToWhere<FighterWithReach>, K, FighterWithReach>): Promise<Array<FighterWithReach[K]>>;
  withReach<K extends keyof FighterWithReach>(query: ComplexSqlQueryValueDebug<ToWhere<FighterWithReach>, K, FighterWithReach>): Promise<DebugResult<Array<FighterWithReach[K]>>>;
  withReach(query: ComplexSqlQuery<ToWhere<FighterWithReach>, FighterWithReach>): Promise<Array<FighterWithReach>>;
  withReach(query: ComplexSqlQueryDebug<ToWhere<FighterWithReach>, FighterWithReach>): Promise<DebugResult<Array<FighterWithReach>>>;
  withReach<N>(query: ComplexSqlQuerySelector<ToWhere<FighterWithReach>, FighterWithReach, N>): Promise<Array<N>>;
  withReach<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterWithReach>, FighterWithReach, N>): Promise<DebugResult<Array<N>>>;
}

export interface OtherName {
  id: number;
  fighterId: number;
  name: string;
}

export interface InsertOtherName {
  id?: number;
  fighterId: number;
  name: string;
}

export interface WhereOtherName {
  id?: number | Array<number> | WhereFunction<number>;
  fighterId?: number | Array<number> | WhereFunction<number>;
  name?: string | Array<string> | WhereFunction<string>;
  and?: Array<WhereOtherName>;
  or?: Array<WhereOtherName>;
}

export interface FighterCoach {
  id: number;
  coachId: number;
  fighterId: number;
  startDate: string;
  endDate: string | null;
}

export interface InsertFighterCoach {
  id?: number;
  coachId: number;
  fighterId: number;
  startDate: string;
  endDate?: string;
}

export interface WhereFighterCoach {
  id?: number | Array<number> | WhereFunction<number>;
  coachId?: number | Array<number> | WhereFunction<number>;
  fighterId?: number | Array<number> | WhereFunction<number>;
  startDate?: string | Array<string> | WhereFunction<string>;
  endDate?: string | Array<string> | WhereFunction<string> | null;
  and?: Array<WhereFighterCoach>;
  or?: Array<WhereFighterCoach>;
}

export interface Ranking {
  id: number;
  fighterId: number;
  weightClassId: number;
  rank: number;
  isInterim: boolean;
}

export interface InsertRanking {
  id?: number;
  fighterId: number;
  weightClassId: number;
  rank: number;
  isInterim: boolean;
}

export interface WhereRanking {
  id?: number | Array<number> | WhereFunction<number>;
  fighterId?: number | Array<number> | WhereFunction<number>;
  weightClassId?: number | Array<number> | WhereFunction<number>;
  rank?: number | Array<number> | WhereFunction<number>;
  isInterim?: boolean | Array<boolean> | WhereFunction<boolean>;
  and?: Array<WhereRanking>;
  or?: Array<WhereRanking>;
}

export interface Method {
  id: number;
  name: string;
  abbreviation: string;
}

export interface InsertMethod {
  id?: number;
  name: string;
  abbreviation: string;
}

export interface WhereMethod {
  id?: number | Array<number> | WhereFunction<number>;
  name?: string | Array<string> | WhereFunction<string>;
  abbreviation?: string | Array<string> | WhereFunction<string>;
  and?: Array<WhereMethod>;
  or?: Array<WhereMethod>;
}

export interface MethodByFighter {
  method: string;
  count: number;
}

export interface MethodCoach {
  fit: number | string | Buffer;
  test: Json;
  tests: Json;
  profile: Json;
}

export interface MethodTopSubmission {
  methodDescription: string | null;
}

export interface MethodByFighterParams {
  fighterId: any;
}

export interface MethodQueries {
  byFighter<N extends Alias<MethodByFighter>>(query: ComplexSqlQueryAliasParams<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, N>): Promise<Array<MethodByFighter & ReturnTypes<N>>>;
  byFighter<N extends Alias<MethodByFighter>>(query: ComplexSqlQueryAliasParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, N>): Promise<DebugResult<Array<MethodByFighter & ReturnTypes<N>>>>;
  byFighter<U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryIncludeParams<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, U>): Promise<Array<MergeIncludes<MethodByFighter, U>>>;
  byFighter<U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryIncludeParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, U>): Promise<DebugResult<Array<MergeIncludes<MethodByFighter, U>>>>;
  byFighter<U extends Includes<TypedDb, MethodByFighter>, N extends Alias<MethodByFighter>>(query: ComplexSqlQueryIncludeAliasParams<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, U, N>): Promise<Array<MergeIncludes<MethodByFighter, U> & ReturnTypes<N>>>;
  byFighter<U extends Includes<TypedDb, MethodByFighter>, N extends Alias<MethodByFighter>>(query: ComplexSqlQueryIncludeAliasParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, U, N>): Promise<DebugResult<Array<MergeIncludes<MethodByFighter, U> & ReturnTypes<N>>>>;
  byFighter<K extends keyof MethodByFighter, N extends Alias<MethodByFighter>>(query: ComplexSqlQueryObjectAliasParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, N>): Promise<Array<Pick<MethodByFighter, K> & ReturnTypes<N>>>;
  byFighter<K extends keyof MethodByFighter, N extends Alias<MethodByFighter>>(query: ComplexSqlQueryObjectAliasParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, N>): Promise<DebugResult<Array<Pick<MethodByFighter, K> & ReturnTypes<N>>>>;
  byFighter<K extends keyof MethodByFighter>(query: ComplexSqlQueryObjectParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter>): Promise<Array<Pick<MethodByFighter, K>>>;
  byFighter<K extends keyof MethodByFighter>(query: ComplexSqlQueryObjectParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter>): Promise<DebugResult<Array<Pick<MethodByFighter, K>>>>;
  byFighter<K extends keyof MethodByFighter>(query: ComplexSqlQueryObjectOmitParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter>): Promise<Array<Omit<MethodByFighter, K>>>;
  byFighter<K extends keyof MethodByFighter>(query: ComplexSqlQueryObjectOmitParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter>): Promise<DebugResult<Array<Omit<MethodByFighter, K>>>>;
  byFighter<K extends keyof MethodByFighter, N extends Alias<MethodByFighter>>(query: ComplexSqlQueryObjectAliasOmitParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, N>): Promise<Array<Omit<MethodByFighter, K> & ReturnTypes<N>>>;
  byFighter<K extends keyof MethodByFighter, N extends Alias<MethodByFighter>>(query: ComplexSqlQueryObjectAliasOmitParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, N>): Promise<DebugResult<Array<Omit<MethodByFighter, K> & ReturnTypes<N>>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryObjectIncludeParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U>): Promise<Array<MergeIncludes<Pick<MethodByFighter, K>, U>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryObjectIncludeParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U>): Promise<DebugResult<Array<MergeIncludes<Pick<MethodByFighter, K>, U>>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryObjectIncludeOmitParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U>): Promise<Array<MergeIncludes<Omit<MethodByFighter, K>, U>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U>): Promise<DebugResult<Array<MergeIncludes<Omit<MethodByFighter, K>, U>>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>, N extends Alias<MethodByFighter>>(query: ComplexSqlQueryObjectIncludeAliasParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U, N>): Promise<Array<MergeIncludes<Pick<MethodByFighter, K>, U> & ReturnTypes<N>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>, N extends Alias<MethodByFighter>>(query: ComplexSqlQueryObjectIncludeAliasParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<MethodByFighter, K>, U> & ReturnTypes<N>>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>, N extends Alias<MethodByFighter>>(query: ComplexSqlQueryObjectIncludeAliasOmitParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U, N>): Promise<Array<MergeIncludes<Omit<MethodByFighter, K>, U> & ReturnTypes<N>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>, N extends Alias<MethodByFighter>>(query: ComplexSqlQueryObjectIncludeAliasOmitParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<MethodByFighter, K>, U> & ReturnTypes<N>>>>;
  byFighter<K extends keyof MethodByFighter>(query: ComplexSqlQueryValueParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter>): Promise<Array<MethodByFighter[K]>>;
  byFighter<K extends keyof MethodByFighter>(query: ComplexSqlQueryValueParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter>): Promise<DebugResult<Array<MethodByFighter[K]>>>;
  byFighter(query: ComplexSqlQueryParams<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter>): Promise<Array<MethodByFighter>>;
  byFighter(query: ComplexSqlQueryParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter>): Promise<DebugResult<Array<MethodByFighter>>>;
  byFighter<N>(query: ComplexSqlQuerySelectorParams<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, N>): Promise<Array<N>>;
  byFighter<N>(query: ComplexSqlQuerySelectorParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, N>): Promise<DebugResult<Array<N>>>;
  coach<N extends Alias<MethodCoach>>(query: ComplexSqlQueryAlias<ToWhere<MethodCoach>, MethodCoach, N>): Promise<Array<MethodCoach & ReturnTypes<N>>>;
  coach<N extends Alias<MethodCoach>>(query: ComplexSqlQueryAliasDebug<ToWhere<MethodCoach>, MethodCoach, N>): Promise<DebugResult<Array<MethodCoach & ReturnTypes<N>>>>;
  coach<U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryInclude<ToWhere<MethodCoach>, MethodCoach, U>): Promise<Array<MergeIncludes<MethodCoach, U>>>;
  coach<U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryIncludeDebug<ToWhere<MethodCoach>, MethodCoach, U>): Promise<DebugResult<Array<MergeIncludes<MethodCoach, U>>>>;
  coach<U extends Includes<TypedDb, MethodCoach>, N extends Alias<MethodCoach>>(query: ComplexSqlQueryIncludeAlias<ToWhere<MethodCoach>, MethodCoach, U, N>): Promise<Array<MergeIncludes<MethodCoach, U> & ReturnTypes<N>>>;
  coach<U extends Includes<TypedDb, MethodCoach>, N extends Alias<MethodCoach>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<MethodCoach>, MethodCoach, U, N>): Promise<DebugResult<Array<MergeIncludes<MethodCoach, U> & ReturnTypes<N>>>>;
  coach<K extends keyof MethodCoach, N extends Alias<MethodCoach>>(query: ComplexSqlQueryObjectAlias<ToWhere<MethodCoach>, K, MethodCoach, N>): Promise<Array<Pick<MethodCoach, K> & ReturnTypes<N>>>;
  coach<K extends keyof MethodCoach, N extends Alias<MethodCoach>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<MethodCoach>, K, MethodCoach, N>): Promise<DebugResult<Array<Pick<MethodCoach, K> & ReturnTypes<N>>>>;
  coach<K extends keyof MethodCoach>(query: ComplexSqlQueryObject<ToWhere<MethodCoach>, K, MethodCoach>): Promise<Array<Pick<MethodCoach, K>>>;
  coach<K extends keyof MethodCoach>(query: ComplexSqlQueryObjectDebug<ToWhere<MethodCoach>, K, MethodCoach>): Promise<DebugResult<Array<Pick<MethodCoach, K>>>>;
  coach<K extends keyof MethodCoach>(query: ComplexSqlQueryObjectOmit<ToWhere<MethodCoach>, K, MethodCoach>): Promise<Array<Omit<MethodCoach, K>>>;
  coach<K extends keyof MethodCoach>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<MethodCoach>, K, MethodCoach>): Promise<DebugResult<Array<Omit<MethodCoach, K>>>>;
  coach<K extends keyof MethodCoach, N extends Alias<MethodCoach>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<MethodCoach>, K, MethodCoach, N>): Promise<Array<Omit<MethodCoach, K> & ReturnTypes<N>>>;
  coach<K extends keyof MethodCoach, N extends Alias<MethodCoach>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<MethodCoach>, K, MethodCoach, N>): Promise<DebugResult<Array<Omit<MethodCoach, K> & ReturnTypes<N>>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryObjectInclude<ToWhere<MethodCoach>, K, MethodCoach, U>): Promise<Array<MergeIncludes<Pick<MethodCoach, K>, U>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<MethodCoach>, K, MethodCoach, U>): Promise<DebugResult<Array<MergeIncludes<Pick<MethodCoach, K>, U>>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<MethodCoach>, K, MethodCoach, U>): Promise<Array<MergeIncludes<Omit<MethodCoach, K>, U>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<MethodCoach>, K, MethodCoach, U>): Promise<DebugResult<Array<MergeIncludes<Omit<MethodCoach, K>, U>>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>, N extends Alias<MethodCoach>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<MethodCoach>, K, MethodCoach, U, N>): Promise<Array<MergeIncludes<Pick<MethodCoach, K>, U> & ReturnTypes<N>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>, N extends Alias<MethodCoach>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<MethodCoach>, K, MethodCoach, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<MethodCoach, K>, U> & ReturnTypes<N>>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>, N extends Alias<MethodCoach>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<MethodCoach>, K, MethodCoach, U, N>): Promise<Array<MergeIncludes<Omit<MethodCoach, K>, U> & ReturnTypes<N>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>, N extends Alias<MethodCoach>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<MethodCoach>, K, MethodCoach, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<MethodCoach, K>, U> & ReturnTypes<N>>>>;
  coach<K extends keyof MethodCoach>(query: ComplexSqlQueryValue<ToWhere<MethodCoach>, K, MethodCoach>): Promise<Array<MethodCoach[K]>>;
  coach<K extends keyof MethodCoach>(query: ComplexSqlQueryValueDebug<ToWhere<MethodCoach>, K, MethodCoach>): Promise<DebugResult<Array<MethodCoach[K]>>>;
  coach(query: ComplexSqlQuery<ToWhere<MethodCoach>, MethodCoach>): Promise<Array<MethodCoach>>;
  coach(query: ComplexSqlQueryDebug<ToWhere<MethodCoach>, MethodCoach>): Promise<DebugResult<Array<MethodCoach>>>;
  coach<N>(query: ComplexSqlQuerySelector<ToWhere<MethodCoach>, MethodCoach, N>): Promise<Array<N>>;
  coach<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<MethodCoach>, MethodCoach, N>): Promise<DebugResult<Array<N>>>;
  topSubmission<N extends Alias<MethodTopSubmission>>(query: ComplexSqlQueryAlias<ToWhere<MethodTopSubmission>, MethodTopSubmission, N>): Promise<Array<MethodTopSubmission & ReturnTypes<N>>>;
  topSubmission<N extends Alias<MethodTopSubmission>>(query: ComplexSqlQueryAliasDebug<ToWhere<MethodTopSubmission>, MethodTopSubmission, N>): Promise<DebugResult<Array<MethodTopSubmission & ReturnTypes<N>>>>;
  topSubmission<U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryInclude<ToWhere<MethodTopSubmission>, MethodTopSubmission, U>): Promise<Array<MergeIncludes<MethodTopSubmission, U>>>;
  topSubmission<U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryIncludeDebug<ToWhere<MethodTopSubmission>, MethodTopSubmission, U>): Promise<DebugResult<Array<MergeIncludes<MethodTopSubmission, U>>>>;
  topSubmission<U extends Includes<TypedDb, MethodTopSubmission>, N extends Alias<MethodTopSubmission>>(query: ComplexSqlQueryIncludeAlias<ToWhere<MethodTopSubmission>, MethodTopSubmission, U, N>): Promise<Array<MergeIncludes<MethodTopSubmission, U> & ReturnTypes<N>>>;
  topSubmission<U extends Includes<TypedDb, MethodTopSubmission>, N extends Alias<MethodTopSubmission>>(query: ComplexSqlQueryIncludeAliasDebug<ToWhere<MethodTopSubmission>, MethodTopSubmission, U, N>): Promise<DebugResult<Array<MergeIncludes<MethodTopSubmission, U> & ReturnTypes<N>>>>;
  topSubmission<K extends keyof MethodTopSubmission, N extends Alias<MethodTopSubmission>>(query: ComplexSqlQueryObjectAlias<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, N>): Promise<Array<Pick<MethodTopSubmission, K> & ReturnTypes<N>>>;
  topSubmission<K extends keyof MethodTopSubmission, N extends Alias<MethodTopSubmission>>(query: ComplexSqlQueryObjectAliasDebug<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, N>): Promise<DebugResult<Array<Pick<MethodTopSubmission, K> & ReturnTypes<N>>>>;
  topSubmission<K extends keyof MethodTopSubmission>(query: ComplexSqlQueryObject<ToWhere<MethodTopSubmission>, K, MethodTopSubmission>): Promise<Array<Pick<MethodTopSubmission, K>>>;
  topSubmission<K extends keyof MethodTopSubmission>(query: ComplexSqlQueryObjectDebug<ToWhere<MethodTopSubmission>, K, MethodTopSubmission>): Promise<DebugResult<Array<Pick<MethodTopSubmission, K>>>>;
  topSubmission<K extends keyof MethodTopSubmission>(query: ComplexSqlQueryObjectOmit<ToWhere<MethodTopSubmission>, K, MethodTopSubmission>): Promise<Array<Omit<MethodTopSubmission, K>>>;
  topSubmission<K extends keyof MethodTopSubmission>(query: ComplexSqlQueryObjectOmitDebug<ToWhere<MethodTopSubmission>, K, MethodTopSubmission>): Promise<DebugResult<Array<Omit<MethodTopSubmission, K>>>>;
  topSubmission<K extends keyof MethodTopSubmission, N extends Alias<MethodTopSubmission>>(query: ComplexSqlQueryObjectAliasOmit<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, N>): Promise<Array<Omit<MethodTopSubmission, K> & ReturnTypes<N>>>;
  topSubmission<K extends keyof MethodTopSubmission, N extends Alias<MethodTopSubmission>>(query: ComplexSqlQueryObjectAliasOmitDebug<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, N>): Promise<DebugResult<Array<Omit<MethodTopSubmission, K> & ReturnTypes<N>>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryObjectInclude<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U>): Promise<Array<MergeIncludes<Pick<MethodTopSubmission, K>, U>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U>): Promise<DebugResult<Array<MergeIncludes<Pick<MethodTopSubmission, K>, U>>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U>): Promise<Array<MergeIncludes<Omit<MethodTopSubmission, K>, U>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U>): Promise<DebugResult<Array<MergeIncludes<Omit<MethodTopSubmission, K>, U>>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>, N extends Alias<MethodTopSubmission>>(query: ComplexSqlQueryObjectIncludeAlias<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U, N>): Promise<Array<MergeIncludes<Pick<MethodTopSubmission, K>, U> & ReturnTypes<N>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>, N extends Alias<MethodTopSubmission>>(query: ComplexSqlQueryObjectIncludeAliasDebug<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<MethodTopSubmission, K>, U> & ReturnTypes<N>>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>, N extends Alias<MethodTopSubmission>>(query: ComplexSqlQueryObjectIncludeAliasOmit<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U, N>): Promise<Array<MergeIncludes<Omit<MethodTopSubmission, K>, U> & ReturnTypes<N>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>, N extends Alias<MethodTopSubmission>>(query: ComplexSqlQueryObjectIncludeAliasOmitDebug<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<MethodTopSubmission, K>, U> & ReturnTypes<N>>>>;
  topSubmission<K extends keyof MethodTopSubmission>(query: ComplexSqlQueryValue<ToWhere<MethodTopSubmission>, K, MethodTopSubmission>): Promise<Array<MethodTopSubmission[K]>>;
  topSubmission<K extends keyof MethodTopSubmission>(query: ComplexSqlQueryValueDebug<ToWhere<MethodTopSubmission>, K, MethodTopSubmission>): Promise<DebugResult<Array<MethodTopSubmission[K]>>>;
  topSubmission(query: ComplexSqlQuery<ToWhere<MethodTopSubmission>, MethodTopSubmission>): Promise<Array<MethodTopSubmission>>;
  topSubmission(query: ComplexSqlQueryDebug<ToWhere<MethodTopSubmission>, MethodTopSubmission>): Promise<DebugResult<Array<MethodTopSubmission>>>;
  topSubmission<N>(query: ComplexSqlQuerySelector<ToWhere<MethodTopSubmission>, MethodTopSubmission, N>): Promise<Array<N>>;
  topSubmission<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<MethodTopSubmission>, MethodTopSubmission, N>): Promise<DebugResult<Array<N>>>;
}

export interface Fight {
  id: number;
  cardId: number;
  fightOrder: number;
  blueId: number;
  redId: number;
  winnerId: number | null;
  methodId: number | null;
  methodDescription: string | null;
  endRound: number | null;
  endSeconds: number | null;
  titleFight: boolean;
  isInterim: boolean;
  weightClassId: number | null;
  oddsBlue: number | null;
  oddsRed: number | null;
  catchweightLbs: number | null;
}

export interface InsertFight {
  id?: number;
  cardId: number;
  fightOrder: number;
  blueId: number;
  redId: number;
  winnerId?: number;
  methodId?: number;
  methodDescription?: string;
  endRound?: number;
  endSeconds?: number;
  titleFight: boolean;
  isInterim: boolean;
  weightClassId?: number;
  oddsBlue?: number;
  oddsRed?: number;
  catchweightLbs?: number;
}

export interface WhereFight {
  id?: number | Array<number> | WhereFunction<number>;
  cardId?: number | Array<number> | WhereFunction<number>;
  fightOrder?: number | Array<number> | WhereFunction<number>;
  blueId?: number | Array<number> | WhereFunction<number>;
  redId?: number | Array<number> | WhereFunction<number>;
  winnerId?: number | Array<number> | WhereFunction<number> | null;
  methodId?: number | Array<number> | WhereFunction<number> | null;
  methodDescription?: string | Array<string> | WhereFunction<string> | null;
  endRound?: number | Array<number> | WhereFunction<number> | null;
  endSeconds?: number | Array<number> | WhereFunction<number> | null;
  titleFight?: boolean | Array<boolean> | WhereFunction<boolean>;
  isInterim?: boolean | Array<boolean> | WhereFunction<boolean>;
  weightClassId?: number | Array<number> | WhereFunction<number> | null;
  oddsBlue?: number | Array<number> | WhereFunction<number> | null;
  oddsRed?: number | Array<number> | WhereFunction<number> | null;
  catchweightLbs?: number | Array<number> | WhereFunction<number> | null;
  and?: Array<WhereFight>;
  or?: Array<WhereFight>;
}

export interface FightByFighter {
  opponent: string;
  win: boolean | null;
  winnerId: number | null;
  method: string;
  methodDescription: string | null;
  eventName: string;
  startTime: Date;
  endRound: number | null;
  endSeconds: number | null;
  titleFight: boolean;
  name: string;
}

export interface FightByFighterParams {
  id: any;
}

export interface FightQueries {
  byFighter<N extends Alias<FightByFighter>>(query: ComplexSqlQueryAliasParams<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter, N>): Promise<Array<FightByFighter & ReturnTypes<N>>>;
  byFighter<N extends Alias<FightByFighter>>(query: ComplexSqlQueryAliasParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter, N>): Promise<DebugResult<Array<FightByFighter & ReturnTypes<N>>>>;
  byFighter<U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryIncludeParams<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter, U>): Promise<Array<MergeIncludes<FightByFighter, U>>>;
  byFighter<U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryIncludeParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter, U>): Promise<DebugResult<Array<MergeIncludes<FightByFighter, U>>>>;
  byFighter<U extends Includes<TypedDb, FightByFighter>, N extends Alias<FightByFighter>>(query: ComplexSqlQueryIncludeAliasParams<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter, U, N>): Promise<Array<MergeIncludes<FightByFighter, U> & ReturnTypes<N>>>;
  byFighter<U extends Includes<TypedDb, FightByFighter>, N extends Alias<FightByFighter>>(query: ComplexSqlQueryIncludeAliasParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter, U, N>): Promise<DebugResult<Array<MergeIncludes<FightByFighter, U> & ReturnTypes<N>>>>;
  byFighter<K extends keyof FightByFighter, N extends Alias<FightByFighter>>(query: ComplexSqlQueryObjectAliasParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, N>): Promise<Array<Pick<FightByFighter, K> & ReturnTypes<N>>>;
  byFighter<K extends keyof FightByFighter, N extends Alias<FightByFighter>>(query: ComplexSqlQueryObjectAliasParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, N>): Promise<DebugResult<Array<Pick<FightByFighter, K> & ReturnTypes<N>>>>;
  byFighter<K extends keyof FightByFighter>(query: ComplexSqlQueryObjectParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter>): Promise<Array<Pick<FightByFighter, K>>>;
  byFighter<K extends keyof FightByFighter>(query: ComplexSqlQueryObjectParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter>): Promise<DebugResult<Array<Pick<FightByFighter, K>>>>;
  byFighter<K extends keyof FightByFighter>(query: ComplexSqlQueryObjectOmitParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter>): Promise<Array<Omit<FightByFighter, K>>>;
  byFighter<K extends keyof FightByFighter>(query: ComplexSqlQueryObjectOmitParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter>): Promise<DebugResult<Array<Omit<FightByFighter, K>>>>;
  byFighter<K extends keyof FightByFighter, N extends Alias<FightByFighter>>(query: ComplexSqlQueryObjectAliasOmitParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, N>): Promise<Array<Omit<FightByFighter, K> & ReturnTypes<N>>>;
  byFighter<K extends keyof FightByFighter, N extends Alias<FightByFighter>>(query: ComplexSqlQueryObjectAliasOmitParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, N>): Promise<DebugResult<Array<Omit<FightByFighter, K> & ReturnTypes<N>>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryObjectIncludeParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U>): Promise<Array<MergeIncludes<Pick<FightByFighter, K>, U>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryObjectIncludeParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FightByFighter, K>, U>>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryObjectIncludeOmitParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U>): Promise<Array<MergeIncludes<Omit<FightByFighter, K>, U>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FightByFighter, K>, U>>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>, N extends Alias<FightByFighter>>(query: ComplexSqlQueryObjectIncludeAliasParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U, N>): Promise<Array<MergeIncludes<Pick<FightByFighter, K>, U> & ReturnTypes<N>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>, N extends Alias<FightByFighter>>(query: ComplexSqlQueryObjectIncludeAliasParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U, N>): Promise<DebugResult<Array<MergeIncludes<Pick<FightByFighter, K>, U> & ReturnTypes<N>>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>, N extends Alias<FightByFighter>>(query: ComplexSqlQueryObjectIncludeAliasOmitParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U, N>): Promise<Array<MergeIncludes<Omit<FightByFighter, K>, U> & ReturnTypes<N>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>, N extends Alias<FightByFighter>>(query: ComplexSqlQueryObjectIncludeAliasOmitParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U, N>): Promise<DebugResult<Array<MergeIncludes<Omit<FightByFighter, K>, U> & ReturnTypes<N>>>>;
  byFighter<K extends keyof FightByFighter>(query: ComplexSqlQueryValueParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter>): Promise<Array<FightByFighter[K]>>;
  byFighter<K extends keyof FightByFighter>(query: ComplexSqlQueryValueParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter>): Promise<DebugResult<Array<FightByFighter[K]>>>;
  byFighter(query: ComplexSqlQueryParams<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter>): Promise<Array<FightByFighter>>;
  byFighter(query: ComplexSqlQueryParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter>): Promise<DebugResult<Array<FightByFighter>>>;
  byFighter<N>(query: ComplexSqlQuerySelectorParams<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter, N>): Promise<Array<N>>;
  byFighter<N>(query: ComplexSqlQuerySelectorParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter, N>): Promise<DebugResult<Array<N>>>;
}

export interface CancelledFight {
  id: number;
  cardId: number;
  cardOrder: number;
  blueId: number;
  redId: number;
  cancelledAt: Date;
  cancellationReason: string | null;
}

export interface InsertCancelledFight {
  id?: number;
  cardId: number;
  cardOrder: number;
  blueId: number;
  redId: number;
  cancelledAt: Date;
  cancellationReason?: string;
}

export interface WhereCancelledFight {
  id?: number | Array<number> | WhereFunction<number>;
  cardId?: number | Array<number> | WhereFunction<number>;
  cardOrder?: number | Array<number> | WhereFunction<number>;
  blueId?: number | Array<number> | WhereFunction<number>;
  redId?: number | Array<number> | WhereFunction<number>;
  cancelledAt?: Date | Array<Date> | WhereFunction<Date>;
  cancellationReason?: string | Array<string> | WhereFunction<string> | null;
  and?: Array<WhereCancelledFight>;
  or?: Array<WhereCancelledFight>;
}

export interface TitleRemoval {
  id: number;
  fighterId: number;
  weightClassId: number;
  isInterim: boolean;
  removedAt: Date;
  reason: string;
}

export interface InsertTitleRemoval {
  id?: number;
  fighterId: number;
  weightClassId: number;
  isInterim: boolean;
  removedAt: Date;
  reason: string;
}

export interface WhereTitleRemoval {
  id?: number | Array<number> | WhereFunction<number>;
  fighterId?: number | Array<number> | WhereFunction<number>;
  weightClassId?: number | Array<number> | WhereFunction<number>;
  isInterim?: boolean | Array<boolean> | WhereFunction<boolean>;
  removedAt?: Date | Array<Date> | WhereFunction<Date>;
  reason?: string | Array<string> | WhereFunction<string>;
  and?: Array<WhereTitleRemoval>;
  or?: Array<WhereTitleRemoval>;
}

export interface FighterProfile {
  rowid: number;
  name: string;
  hometown: string;
}

export interface InsertFighterProfile {
  rowid?: number;
  name: string;
  hometown: string;
}

export interface WhereFighterProfile {
  rowid?: number | Array<number> | WhereFunction<number>;
  name?: string | Array<string> | WhereFunction<string>;
  hometown?: string | Array<string> | WhereFunction<string>;
  fighterProfiles?: string;
  and?: Array<WhereFighterProfile>;
  or?: Array<WhereFighterProfile>;
}

export interface Opponent {
  fightId: number;
  startTime: Date;
  fighterId: number;
  opponentId: number;
  methodId: number | null;
}

export interface InsertOpponent {
  fightId: number;
  startTime: Date;
  fighterId: number;
  opponentId: number;
  methodId?: number;
}

export interface WhereOpponent {
  fightId?: number | Array<number> | WhereFunction<number>;
  startTime?: Date | Array<Date> | WhereFunction<Date>;
  fighterId?: number | Array<number> | WhereFunction<number>;
  opponentId?: number | Array<number> | WhereFunction<number>;
  methodId?: number | Array<number> | WhereFunction<number> | null;
  and?: Array<WhereOpponent>;
  or?: Array<WhereOpponent>;
}

export interface DefineJoin {
  weightClasses: DefineWhere<WhereWeightClass>;
  locations: DefineWhere<WhereLocation>;
  events: DefineWhere<WhereEvent>;
  cards: DefineWhere<WhereCard>;
  coaches: DefineWhere<WhereCoach>;
  fighters: DefineWhere<WhereFighter>;
  otherNames: DefineWhere<WhereOtherName>;
  fighterCoaches: DefineWhere<WhereFighterCoach>;
  rankings: DefineWhere<WhereRanking>;
  methods: DefineWhere<WhereMethod>;
  fights: DefineWhere<WhereFight>;
  cancelledFights: DefineWhere<WhereCancelledFight>;
  titleRemovals: DefineWhere<WhereTitleRemoval>;
  fighterProfiles: DefineWhere<WhereFighterProfile>;
  opponents: DefineWhere<WhereOpponent>;
}

type Unwrap<T extends any[]> = {
  [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K];
};

export interface TypedDb {
  [key: string]: any;
  weightClasses: Queries<WeightClass, InsertWeightClass, WhereWeightClass, number, TypedDb> & DefineQuery<DefineJoin, WeightClass>;
  locations: Queries<Location, InsertLocation, WhereLocation, number, TypedDb> & LocationQueries & DefineQuery<DefineJoin, Location>;
  events: Queries<Event, InsertEvent, WhereEvent, number, TypedDb> & EventQueries & DefineQuery<DefineJoin, Event>;
  cards: Queries<Card, InsertCard, WhereCard, number, TypedDb> & DefineQuery<DefineJoin, Card>;
  coaches: Queries<Coach, InsertCoach, WhereCoach, number, TypedDb> & CoachQueries & DefineQuery<DefineJoin, Coach>;
  fighters: Queries<Fighter, InsertFighter, WhereFighter, number, TypedDb> & FighterQueries & DefineQuery<DefineJoin, Fighter>;
  otherNames: Queries<OtherName, InsertOtherName, WhereOtherName, number, TypedDb> & DefineQuery<DefineJoin, OtherName>;
  fighterCoaches: Queries<FighterCoach, InsertFighterCoach, WhereFighterCoach, number, TypedDb> & DefineQuery<DefineJoin, FighterCoach>;
  rankings: Queries<Ranking, InsertRanking, WhereRanking, number, TypedDb> & DefineQuery<DefineJoin, Ranking>;
  methods: Queries<Method, InsertMethod, WhereMethod, number, TypedDb> & MethodQueries & DefineQuery<DefineJoin, Method>;
  fights: Queries<Fight, InsertFight, WhereFight, number, TypedDb> & FightQueries & DefineQuery<DefineJoin, Fight>;
  cancelledFights: Queries<CancelledFight, InsertCancelledFight, WhereCancelledFight, number, TypedDb> & DefineQuery<DefineJoin, CancelledFight>;
  titleRemovals: Queries<TitleRemoval, InsertTitleRemoval, WhereTitleRemoval, number, TypedDb> & DefineQuery<DefineJoin, TitleRemoval>;
  fighterProfiles: VirtualQueries<FighterProfile, WhereFighterProfile> & DefineQuery<DefineJoin, FighterProfile>;
  opponents: Pick<Queries<Opponent, InsertOpponent, WhereOpponent, undefined, TypedDb>, 'get' | 'many' | 'query' | 'first'> & DefineQuery<DefineJoin, Opponent>;
  exec(sql: string): Promise<void>;
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  pragma(sql: string): Promise<any[]>;
  deferForeignKeys(): Promise<void>;
  getTransaction(): Promise<TypedDb>;
  batch:<T extends any[]> (batcher: (bx: TypedDb) => T) => Promise<Unwrap<T>>;
}

export const database: any;
export const db: TypedDb;
