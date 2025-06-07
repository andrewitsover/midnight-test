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

export interface GroupQueryObjectDebug<T, W, K, U> extends GroupQueryObject<T, W, K, U> {
  debug: true;
}

export interface GroupQueryObjectAliasDebug<T, W, K, U, A> extends GroupQueryObjectAlias<T, W, K, U, A> {
  debug: true;
}

export interface ComplexQueryInclude<W, T, U extends ObjectFunction> extends Keywords<Array<keyof T> | keyof T> {
  where?: W;
  select?: undefined;
  include?: U;
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

export interface ComplexQueryObjectInclude<W, K, T, U extends ObjectFunction> extends Keywords<keyof T | Array<keyof T>> {
  where?: W;
  select: (keyof T)[] | K[];
  include?: U;
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

export interface ComplexQueryObjectIncludeOmit<W, K, T, U extends ObjectFunction> extends Keywords<keyof T | Array<keyof T>> {
  where?: W;
  select?: undefined;
  omit: (keyof T)[] | K[] | K;
  include?: U;
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

export interface ComplexQueryValue<W, K, T> extends Keywords<Array<keyof T> | keyof T> {
  where?: W;
  select: K;
  omit?: undefined;
  include?: undefined;
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

export interface GroupQueryObject<T, W, K, U> {
  where?: W;
  column?: keyof T;
  distinct?: keyof T;
  orderBy?: K;
  desc?: boolean;
  limit?: number;
  offset?: number;
  include?: U;
  alias?: undefined;
}

export interface GroupQueryObjectAlias<T, W, K, U, A> {
  where?: W;
  column?: keyof T;
  distinct?: keyof T;
  orderBy?: K;
  desc?: boolean;
  limit?: number;
  offset?: number;
  include?: U;
  alias: A;
}

export interface AggregateMethods<T, W, K extends keyof T, Y> {
  count<U extends Includes<Y, (Pick<T, K> & { count: number })>>(params?: GroupQueryObject<T, W & ToWhere<{ count: number }>, K | 'count', U>): Promise<Array<MergeIncludes<Pick<T, K> & { count: number }, U>>>;
  count<A extends string, U extends Includes<Y, (Pick<T, K> & { count: number })>>(params?: GroupQueryObjectAlias<T, W & ToWhere<{ count: number }>, K | 'count', U, A>): Promise<Array<MergeIncludes<Pick<T, K> & Record<A, number>, U>>>;
  avg<U extends Includes<Y, (Pick<T, K> & { avg: number })>>(params: GroupQueryObject<T, W & ToWhere<{ avg: number }>, K | 'avg', U>): Promise<Array<MergeIncludes<Pick<T, K> & { avg: number }, U>>>;
  avg<A extends string, U extends Includes<Y, (Pick<T, K> & { avg: number })>>(params: GroupQueryObjectAlias<T, W & ToWhere<{ avg: number }>, K | 'avg', U, A>): Promise<Array<MergeIncludes<Pick<T, K> & Record<A, number>, U>>>;
  max<U extends Includes<Y, (Pick<T, K> & { min: number })>>(params: GroupQueryObject<T, W & ToWhere<{ max: number }>, K | 'max', U>): Promise<Array<MergeIncludes<Pick<T, K> & { max: number }, U>>>;
  max<A extends string, U extends Includes<Y, (Pick<T, K> & { min: number })>>(params: GroupQueryObjectAlias<T, W & ToWhere<{ max: number }>, K | 'max', U, A>): Promise<Array<MergeIncludes<Pick<T, K> & Record<A, number>, U>>>;
  min<U extends Includes<Y, (Pick<T, K> & { max: number })>>(params: GroupQueryObject<T, W & ToWhere<{ min: number }>, K | 'min', U>): Promise<Array<MergeIncludes<Pick<T, K> & { min: number }, U>>>;
  min<A extends string, U extends Includes<Y, (Pick<T, K> & { max: number })>>(params: GroupQueryObjectAlias<T, W & ToWhere<{ min: number }>, K | 'min', U, A>): Promise<Array<MergeIncludes<Pick<T, K> & Record<A, number>, U>>>;
  sum<U extends Includes<Y, (Pick<T, K> & { sum: number })>>(params: GroupQueryObject<T, W & ToWhere<{ sum: number }>, K | 'sum', U>): Promise<Array<MergeIncludes<Pick<T, K> & { sum: number }, U>>>;
  sum<A extends string, U extends Includes<Y, (Pick<T, K> & { sum: number })>>(params: GroupQueryObjectAlias<T, W & ToWhere<{ sum: number }>, K | 'sum', U, A>): Promise<Array<MergeIncludes<Pick<T, K> & Record<A, number>, U>>>;
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
  query<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectInclude<W, K, T, U>): Promise<Array<MergeIncludes<Pick<T, K>, U>>>;
  query<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeDebug<W, K, T, U>): Promise<DebugResult<Array<MergeIncludes<Pick<T, K>, U>>>>;
  query<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmit<W, K, T, U>): Promise<Array<MergeIncludes<Omit<T, K>, U>>>;
  query<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmitDebug<W, K, T, U>): Promise<DebugResult<Array<MergeIncludes<Omit<T, K>, U>>>>;
  query<K extends keyof T>(query: ComplexQueryValue<W, K, T>): Promise<Array<T[K]>>;
  query<K extends keyof T>(query: ComplexQueryValueDebug<W, K, T>): Promise<DebugResult<Array<T[K]>>>;
  query<U extends Includes<Y, T>>(query: ComplexQueryInclude<W, T, U>): Promise<Array<MergeIncludes<T, U>>>;
  query<U extends Includes<Y, T>>(query: ComplexQueryIncludeDebug<W, T, U>): Promise<DebugResult<Array<MergeIncludes<T, U>>>>;
  query<N>(query: ComplexQuerySelector<W, T, N>): Promise<Array<N>>;
  query<N>(query: ComplexQuerySelectorDebug<W, T, N>): Promise<DebugResult<Array<N>>>;
  first<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectInclude<W, K, T, U>): Promise<MergeIncludes<Pick<T, K>, U> | undefined>;
  first<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeDebug<W, K, T, U>): Promise<DebugResult<MergeIncludes<Pick<T, K>, U> | undefined>>;
  first<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmit<W, K, T, U>): Promise<MergeIncludes<Omit<T, K>, U> | undefined>;
  first<K extends keyof T, U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmitDebug<W, K, T, U>): Promise<DebugResult<MergeIncludes<Omit<T, K>, U> | undefined>>;
  first<K extends keyof T>(query: ComplexQueryValue<W, K, T>): Promise<T[K] | undefined>;
  first<K extends keyof T>(query: ComplexQueryValueDebug<W, K, T>): Promise<DebugResult<T[K] | undefined>>;
  first<U extends Includes<Y, T>>(query: ComplexQueryInclude<W, T, U>): Promise<MergeIncludes<T, U> | undefined>;
  first<U extends Includes<Y, T>>(query: ComplexQueryIncludeDebug<W, T, U>): Promise<DebugResult<MergeIncludes<T, U> | undefined>>;
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
  groupBy<K extends keyof T>(columns: K | Array<K>): AggregateMethods<T, W, K, Y>;
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

export interface LocationDistanceFrom {
  id: number;
  name: string;
  address: string;
  lat: number;
  long: number;
  distanceKm: number | null;
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

export interface LocationDistanceFromParams {
  lat: any;
  long: any;
}

export interface LocationQueries {
  byId<U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryIncludeParams<LocationByIdParams, ToWhere<LocationById>, LocationById, U>): Promise<Array<MergeIncludes<LocationById, U>>>;
  byId<U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryIncludeParamsDebug<LocationByIdParams, ToWhere<LocationById>, LocationById, U>): Promise<DebugResult<Array<MergeIncludes<LocationById, U>>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryObjectIncludeParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U>): Promise<Array<MergeIncludes<Pick<LocationById, K>, U>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryObjectIncludeParamsDebug<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationById, K>, U>>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryObjectIncludeOmitParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U>): Promise<Array<MergeIncludes<Omit<LocationById, K>, U>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationById, K>, U>>>>;
  byId<K extends keyof LocationById>(query: ComplexSqlQueryValueParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById>): Promise<Array<LocationById[K]>>;
  byId<K extends keyof LocationById>(query: ComplexSqlQueryValueParamsDebug<LocationByIdParams, ToWhere<LocationById>, K, LocationById>): Promise<DebugResult<Array<LocationById[K]>>>;
  byId<N>(query: ComplexSqlQuerySelectorParams<LocationByIdParams, ToWhere<LocationById>, LocationById, N>): Promise<Array<N>>;
  byId<N>(query: ComplexSqlQuerySelectorParamsDebug<LocationByIdParams, ToWhere<LocationById>, LocationById, N>): Promise<DebugResult<Array<N>>>;
  byMethod<U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryIncludeParams<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, U>): Promise<Array<MergeIncludes<LocationByMethod, U>>>;
  byMethod<U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryIncludeParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, U>): Promise<DebugResult<Array<MergeIncludes<LocationByMethod, U>>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryObjectIncludeParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U>): Promise<Array<MergeIncludes<Pick<LocationByMethod, K>, U>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryObjectIncludeParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationByMethod, K>, U>>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryObjectIncludeOmitParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U>): Promise<Array<MergeIncludes<Omit<LocationByMethod, K>, U>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationByMethod, K>, U>>>>;
  byMethod<K extends keyof LocationByMethod>(query: ComplexSqlQueryValueParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod>): Promise<Array<LocationByMethod[K]>>;
  byMethod<K extends keyof LocationByMethod>(query: ComplexSqlQueryValueParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod>): Promise<DebugResult<Array<LocationByMethod[K]>>>;
  byMethod<N>(query: ComplexSqlQuerySelectorParams<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, N>): Promise<Array<N>>;
  byMethod<N>(query: ComplexSqlQuerySelectorParamsDebug<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, N>): Promise<DebugResult<Array<N>>>;
  detailedEvents<U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryInclude<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, U>): Promise<Array<MergeIncludes<LocationDetailedEvents, U>>>;
  detailedEvents<U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryIncludeDebug<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, U>): Promise<DebugResult<Array<MergeIncludes<LocationDetailedEvents, U>>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryObjectInclude<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U>): Promise<Array<MergeIncludes<Pick<LocationDetailedEvents, K>, U>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationDetailedEvents, K>, U>>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U>): Promise<Array<MergeIncludes<Omit<LocationDetailedEvents, K>, U>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationDetailedEvents, K>, U>>>>;
  detailedEvents<K extends keyof LocationDetailedEvents>(query: ComplexSqlQueryValue<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents>): Promise<Array<LocationDetailedEvents[K]>>;
  detailedEvents<K extends keyof LocationDetailedEvents>(query: ComplexSqlQueryValueDebug<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents>): Promise<DebugResult<Array<LocationDetailedEvents[K]>>>;
  detailedEvents<N>(query: ComplexSqlQuerySelector<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, N>): Promise<Array<N>>;
  detailedEvents<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, N>): Promise<DebugResult<Array<N>>>;
  distanceFrom<U extends Includes<TypedDb, LocationDistanceFrom>>(query: ComplexSqlQueryIncludeParams<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, LocationDistanceFrom, U>): Promise<Array<MergeIncludes<LocationDistanceFrom, U>>>;
  distanceFrom<U extends Includes<TypedDb, LocationDistanceFrom>>(query: ComplexSqlQueryIncludeParamsDebug<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, LocationDistanceFrom, U>): Promise<DebugResult<Array<MergeIncludes<LocationDistanceFrom, U>>>>;
  distanceFrom<K extends keyof LocationDistanceFrom, U extends Includes<TypedDb, LocationDistanceFrom>>(query: ComplexSqlQueryObjectIncludeParams<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, K, LocationDistanceFrom, U>): Promise<Array<MergeIncludes<Pick<LocationDistanceFrom, K>, U>>>;
  distanceFrom<K extends keyof LocationDistanceFrom, U extends Includes<TypedDb, LocationDistanceFrom>>(query: ComplexSqlQueryObjectIncludeParamsDebug<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, K, LocationDistanceFrom, U>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationDistanceFrom, K>, U>>>>;
  distanceFrom<K extends keyof LocationDistanceFrom, U extends Includes<TypedDb, LocationDistanceFrom>>(query: ComplexSqlQueryObjectIncludeOmitParams<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, K, LocationDistanceFrom, U>): Promise<Array<MergeIncludes<Omit<LocationDistanceFrom, K>, U>>>;
  distanceFrom<K extends keyof LocationDistanceFrom, U extends Includes<TypedDb, LocationDistanceFrom>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, K, LocationDistanceFrom, U>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationDistanceFrom, K>, U>>>>;
  distanceFrom<K extends keyof LocationDistanceFrom>(query: ComplexSqlQueryValueParams<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, K, LocationDistanceFrom>): Promise<Array<LocationDistanceFrom[K]>>;
  distanceFrom<K extends keyof LocationDistanceFrom>(query: ComplexSqlQueryValueParamsDebug<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, K, LocationDistanceFrom>): Promise<DebugResult<Array<LocationDistanceFrom[K]>>>;
  distanceFrom<N>(query: ComplexSqlQuerySelectorParams<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, LocationDistanceFrom, N>): Promise<Array<N>>;
  distanceFrom<N>(query: ComplexSqlQuerySelectorParamsDebug<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, LocationDistanceFrom, N>): Promise<DebugResult<Array<N>>>;
  events<U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryInclude<ToWhere<LocationEvents>, LocationEvents, U>): Promise<Array<MergeIncludes<LocationEvents, U>>>;
  events<U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryIncludeDebug<ToWhere<LocationEvents>, LocationEvents, U>): Promise<DebugResult<Array<MergeIncludes<LocationEvents, U>>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryObjectInclude<ToWhere<LocationEvents>, K, LocationEvents, U>): Promise<Array<MergeIncludes<Pick<LocationEvents, K>, U>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<LocationEvents>, K, LocationEvents, U>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationEvents, K>, U>>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<LocationEvents>, K, LocationEvents, U>): Promise<Array<MergeIncludes<Omit<LocationEvents, K>, U>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<LocationEvents>, K, LocationEvents, U>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationEvents, K>, U>>>>;
  events<K extends keyof LocationEvents>(query: ComplexSqlQueryValue<ToWhere<LocationEvents>, K, LocationEvents>): Promise<Array<LocationEvents[K]>>;
  events<K extends keyof LocationEvents>(query: ComplexSqlQueryValueDebug<ToWhere<LocationEvents>, K, LocationEvents>): Promise<DebugResult<Array<LocationEvents[K]>>>;
  events<N>(query: ComplexSqlQuerySelector<ToWhere<LocationEvents>, LocationEvents, N>): Promise<Array<N>>;
  events<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<LocationEvents>, LocationEvents, N>): Promise<DebugResult<Array<N>>>;
  winners<U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryInclude<ToWhere<LocationWinners>, LocationWinners, U>): Promise<Array<MergeIncludes<LocationWinners, U>>>;
  winners<U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryIncludeDebug<ToWhere<LocationWinners>, LocationWinners, U>): Promise<DebugResult<Array<MergeIncludes<LocationWinners, U>>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryObjectInclude<ToWhere<LocationWinners>, K, LocationWinners, U>): Promise<Array<MergeIncludes<Pick<LocationWinners, K>, U>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<LocationWinners>, K, LocationWinners, U>): Promise<DebugResult<Array<MergeIncludes<Pick<LocationWinners, K>, U>>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<LocationWinners>, K, LocationWinners, U>): Promise<Array<MergeIncludes<Omit<LocationWinners, K>, U>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<LocationWinners>, K, LocationWinners, U>): Promise<DebugResult<Array<MergeIncludes<Omit<LocationWinners, K>, U>>>>;
  winners<K extends keyof LocationWinners>(query: ComplexSqlQueryValue<ToWhere<LocationWinners>, K, LocationWinners>): Promise<Array<LocationWinners[K]>>;
  winners<K extends keyof LocationWinners>(query: ComplexSqlQueryValueDebug<ToWhere<LocationWinners>, K, LocationWinners>): Promise<DebugResult<Array<LocationWinners[K]>>>;
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

export interface EventAwayFrom {
  id: number;
  name: string;
  startTime: Date;
  locationId: number | null;
  diff: string | null;
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

export interface EventAwayFromParams {
  date: any;
}

export interface EventQueries {
  awayFrom<U extends Includes<TypedDb, EventAwayFrom>>(query: ComplexSqlQueryIncludeParams<EventAwayFromParams, ToWhere<EventAwayFrom>, EventAwayFrom, U>): Promise<Array<MergeIncludes<EventAwayFrom, U>>>;
  awayFrom<U extends Includes<TypedDb, EventAwayFrom>>(query: ComplexSqlQueryIncludeParamsDebug<EventAwayFromParams, ToWhere<EventAwayFrom>, EventAwayFrom, U>): Promise<DebugResult<Array<MergeIncludes<EventAwayFrom, U>>>>;
  awayFrom<K extends keyof EventAwayFrom, U extends Includes<TypedDb, EventAwayFrom>>(query: ComplexSqlQueryObjectIncludeParams<EventAwayFromParams, ToWhere<EventAwayFrom>, K, EventAwayFrom, U>): Promise<Array<MergeIncludes<Pick<EventAwayFrom, K>, U>>>;
  awayFrom<K extends keyof EventAwayFrom, U extends Includes<TypedDb, EventAwayFrom>>(query: ComplexSqlQueryObjectIncludeParamsDebug<EventAwayFromParams, ToWhere<EventAwayFrom>, K, EventAwayFrom, U>): Promise<DebugResult<Array<MergeIncludes<Pick<EventAwayFrom, K>, U>>>>;
  awayFrom<K extends keyof EventAwayFrom, U extends Includes<TypedDb, EventAwayFrom>>(query: ComplexSqlQueryObjectIncludeOmitParams<EventAwayFromParams, ToWhere<EventAwayFrom>, K, EventAwayFrom, U>): Promise<Array<MergeIncludes<Omit<EventAwayFrom, K>, U>>>;
  awayFrom<K extends keyof EventAwayFrom, U extends Includes<TypedDb, EventAwayFrom>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<EventAwayFromParams, ToWhere<EventAwayFrom>, K, EventAwayFrom, U>): Promise<DebugResult<Array<MergeIncludes<Omit<EventAwayFrom, K>, U>>>>;
  awayFrom<K extends keyof EventAwayFrom>(query: ComplexSqlQueryValueParams<EventAwayFromParams, ToWhere<EventAwayFrom>, K, EventAwayFrom>): Promise<Array<EventAwayFrom[K]>>;
  awayFrom<K extends keyof EventAwayFrom>(query: ComplexSqlQueryValueParamsDebug<EventAwayFromParams, ToWhere<EventAwayFrom>, K, EventAwayFrom>): Promise<DebugResult<Array<EventAwayFrom[K]>>>;
  awayFrom<N>(query: ComplexSqlQuerySelectorParams<EventAwayFromParams, ToWhere<EventAwayFrom>, EventAwayFrom, N>): Promise<Array<N>>;
  awayFrom<N>(query: ComplexSqlQuerySelectorParamsDebug<EventAwayFromParams, ToWhere<EventAwayFrom>, EventAwayFrom, N>): Promise<DebugResult<Array<N>>>;
  from<U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryInclude<ToWhere<EventFrom>, EventFrom, U>): Promise<Array<MergeIncludes<EventFrom, U>>>;
  from<U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryIncludeDebug<ToWhere<EventFrom>, EventFrom, U>): Promise<DebugResult<Array<MergeIncludes<EventFrom, U>>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventFrom>, K, EventFrom, U>): Promise<Array<MergeIncludes<Pick<EventFrom, K>, U>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<EventFrom>, K, EventFrom, U>): Promise<DebugResult<Array<MergeIncludes<Pick<EventFrom, K>, U>>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventFrom>, K, EventFrom, U>): Promise<Array<MergeIncludes<Omit<EventFrom, K>, U>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<EventFrom>, K, EventFrom, U>): Promise<DebugResult<Array<MergeIncludes<Omit<EventFrom, K>, U>>>>;
  from<K extends keyof EventFrom>(query: ComplexSqlQueryValue<ToWhere<EventFrom>, K, EventFrom>): Promise<Array<EventFrom[K]>>;
  from<K extends keyof EventFrom>(query: ComplexSqlQueryValueDebug<ToWhere<EventFrom>, K, EventFrom>): Promise<DebugResult<Array<EventFrom[K]>>>;
  from<N>(query: ComplexSqlQuerySelector<ToWhere<EventFrom>, EventFrom, N>): Promise<Array<N>>;
  from<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<EventFrom>, EventFrom, N>): Promise<DebugResult<Array<N>>>;
  lag<U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryInclude<ToWhere<EventLag>, EventLag, U>): Promise<Array<MergeIncludes<EventLag, U>>>;
  lag<U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryIncludeDebug<ToWhere<EventLag>, EventLag, U>): Promise<DebugResult<Array<MergeIncludes<EventLag, U>>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventLag>, K, EventLag, U>): Promise<Array<MergeIncludes<Pick<EventLag, K>, U>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<EventLag>, K, EventLag, U>): Promise<DebugResult<Array<MergeIncludes<Pick<EventLag, K>, U>>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventLag>, K, EventLag, U>): Promise<Array<MergeIncludes<Omit<EventLag, K>, U>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<EventLag>, K, EventLag, U>): Promise<DebugResult<Array<MergeIncludes<Omit<EventLag, K>, U>>>>;
  lag<K extends keyof EventLag>(query: ComplexSqlQueryValue<ToWhere<EventLag>, K, EventLag>): Promise<Array<EventLag[K]>>;
  lag<K extends keyof EventLag>(query: ComplexSqlQueryValueDebug<ToWhere<EventLag>, K, EventLag>): Promise<DebugResult<Array<EventLag[K]>>>;
  lag<N>(query: ComplexSqlQuerySelector<ToWhere<EventLag>, EventLag, N>): Promise<Array<N>>;
  lag<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<EventLag>, EventLag, N>): Promise<DebugResult<Array<N>>>;
  operator<U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryInclude<ToWhere<EventOperator>, EventOperator, U>): Promise<Array<MergeIncludes<EventOperator, U>>>;
  operator<U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryIncludeDebug<ToWhere<EventOperator>, EventOperator, U>): Promise<DebugResult<Array<MergeIncludes<EventOperator, U>>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventOperator>, K, EventOperator, U>): Promise<Array<MergeIncludes<Pick<EventOperator, K>, U>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<EventOperator>, K, EventOperator, U>): Promise<DebugResult<Array<MergeIncludes<Pick<EventOperator, K>, U>>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventOperator>, K, EventOperator, U>): Promise<Array<MergeIncludes<Omit<EventOperator, K>, U>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<EventOperator>, K, EventOperator, U>): Promise<DebugResult<Array<MergeIncludes<Omit<EventOperator, K>, U>>>>;
  operator<K extends keyof EventOperator>(query: ComplexSqlQueryValue<ToWhere<EventOperator>, K, EventOperator>): Promise<Array<EventOperator[K]>>;
  operator<K extends keyof EventOperator>(query: ComplexSqlQueryValueDebug<ToWhere<EventOperator>, K, EventOperator>): Promise<DebugResult<Array<EventOperator[K]>>>;
  operator<N>(query: ComplexSqlQuerySelector<ToWhere<EventOperator>, EventOperator, N>): Promise<Array<N>>;
  operator<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<EventOperator>, EventOperator, N>): Promise<DebugResult<Array<N>>>;
  spaces<U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryInclude<ToWhere<EventSpaces>, EventSpaces, U>): Promise<Array<MergeIncludes<EventSpaces, U>>>;
  spaces<U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryIncludeDebug<ToWhere<EventSpaces>, EventSpaces, U>): Promise<DebugResult<Array<MergeIncludes<EventSpaces, U>>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventSpaces>, K, EventSpaces, U>): Promise<Array<MergeIncludes<Pick<EventSpaces, K>, U>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<EventSpaces>, K, EventSpaces, U>): Promise<DebugResult<Array<MergeIncludes<Pick<EventSpaces, K>, U>>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventSpaces>, K, EventSpaces, U>): Promise<Array<MergeIncludes<Omit<EventSpaces, K>, U>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<EventSpaces>, K, EventSpaces, U>): Promise<DebugResult<Array<MergeIncludes<Omit<EventSpaces, K>, U>>>>;
  spaces<K extends keyof EventSpaces>(query: ComplexSqlQueryValue<ToWhere<EventSpaces>, K, EventSpaces>): Promise<Array<EventSpaces[K]>>;
  spaces<K extends keyof EventSpaces>(query: ComplexSqlQueryValueDebug<ToWhere<EventSpaces>, K, EventSpaces>): Promise<DebugResult<Array<EventSpaces[K]>>>;
  spaces<N>(query: ComplexSqlQuerySelector<ToWhere<EventSpaces>, EventSpaces, N>): Promise<Array<N>>;
  spaces<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<EventSpaces>, EventSpaces, N>): Promise<DebugResult<Array<N>>>;
  test<U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryInclude<ToWhere<EventTest>, EventTest, U>): Promise<Array<MergeIncludes<EventTest, U>>>;
  test<U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryIncludeDebug<ToWhere<EventTest>, EventTest, U>): Promise<DebugResult<Array<MergeIncludes<EventTest, U>>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventTest>, K, EventTest, U>): Promise<Array<MergeIncludes<Pick<EventTest, K>, U>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<EventTest>, K, EventTest, U>): Promise<DebugResult<Array<MergeIncludes<Pick<EventTest, K>, U>>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventTest>, K, EventTest, U>): Promise<Array<MergeIncludes<Omit<EventTest, K>, U>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<EventTest>, K, EventTest, U>): Promise<DebugResult<Array<MergeIncludes<Omit<EventTest, K>, U>>>>;
  test<K extends keyof EventTest>(query: ComplexSqlQueryValue<ToWhere<EventTest>, K, EventTest>): Promise<Array<EventTest[K]>>;
  test<K extends keyof EventTest>(query: ComplexSqlQueryValueDebug<ToWhere<EventTest>, K, EventTest>): Promise<DebugResult<Array<EventTest[K]>>>;
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
  from<U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryInclude<ToWhere<CoachFrom>, CoachFrom, U>): Promise<Array<MergeIncludes<CoachFrom, U>>>;
  from<U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryIncludeDebug<ToWhere<CoachFrom>, CoachFrom, U>): Promise<DebugResult<Array<MergeIncludes<CoachFrom, U>>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryObjectInclude<ToWhere<CoachFrom>, K, CoachFrom, U>): Promise<Array<MergeIncludes<Pick<CoachFrom, K>, U>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<CoachFrom>, K, CoachFrom, U>): Promise<DebugResult<Array<MergeIncludes<Pick<CoachFrom, K>, U>>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<CoachFrom>, K, CoachFrom, U>): Promise<Array<MergeIncludes<Omit<CoachFrom, K>, U>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<CoachFrom>, K, CoachFrom, U>): Promise<DebugResult<Array<MergeIncludes<Omit<CoachFrom, K>, U>>>>;
  from<K extends keyof CoachFrom>(query: ComplexSqlQueryValue<ToWhere<CoachFrom>, K, CoachFrom>): Promise<Array<CoachFrom[K]>>;
  from<K extends keyof CoachFrom>(query: ComplexSqlQueryValueDebug<ToWhere<CoachFrom>, K, CoachFrom>): Promise<DebugResult<Array<CoachFrom[K]>>>;
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
  byHeight<U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryInclude<ToWhere<FighterByHeight>, FighterByHeight, U>): Promise<Array<MergeIncludes<FighterByHeight, U>>>;
  byHeight<U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterByHeight>, FighterByHeight, U>): Promise<DebugResult<Array<MergeIncludes<FighterByHeight, U>>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterByHeight>, K, FighterByHeight, U>): Promise<Array<MergeIncludes<Pick<FighterByHeight, K>, U>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterByHeight>, K, FighterByHeight, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterByHeight, K>, U>>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterByHeight>, K, FighterByHeight, U>): Promise<Array<MergeIncludes<Omit<FighterByHeight, K>, U>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterByHeight>, K, FighterByHeight, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterByHeight, K>, U>>>>;
  byHeight<K extends keyof FighterByHeight>(query: ComplexSqlQueryValue<ToWhere<FighterByHeight>, K, FighterByHeight>): Promise<Array<FighterByHeight[K]>>;
  byHeight<K extends keyof FighterByHeight>(query: ComplexSqlQueryValueDebug<ToWhere<FighterByHeight>, K, FighterByHeight>): Promise<DebugResult<Array<FighterByHeight[K]>>>;
  byHeight<N>(query: ComplexSqlQuerySelector<ToWhere<FighterByHeight>, FighterByHeight, N>): Promise<Array<N>>;
  byHeight<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterByHeight>, FighterByHeight, N>): Promise<DebugResult<Array<N>>>;
  common<U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryIncludeParams<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, U>): Promise<Array<MergeIncludes<FighterCommon, U>>>;
  common<U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryIncludeParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, U>): Promise<DebugResult<Array<MergeIncludes<FighterCommon, U>>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryObjectIncludeParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U>): Promise<Array<MergeIncludes<Pick<FighterCommon, K>, U>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryObjectIncludeParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterCommon, K>, U>>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U>): Promise<Array<MergeIncludes<Omit<FighterCommon, K>, U>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterCommon, K>, U>>>>;
  common<K extends keyof FighterCommon>(query: ComplexSqlQueryValueParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon>): Promise<Array<FighterCommon[K]>>;
  common<K extends keyof FighterCommon>(query: ComplexSqlQueryValueParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon>): Promise<DebugResult<Array<FighterCommon[K]>>>;
  common<N>(query: ComplexSqlQuerySelectorParams<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, N>): Promise<Array<N>>;
  common<N>(query: ComplexSqlQuerySelectorParamsDebug<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, N>): Promise<DebugResult<Array<N>>>;
  extract<U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryIncludeParams<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, U>): Promise<Array<MergeIncludes<FighterExtract, U>>>;
  extract<U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryIncludeParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, U>): Promise<DebugResult<Array<MergeIncludes<FighterExtract, U>>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryObjectIncludeParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U>): Promise<Array<MergeIncludes<Pick<FighterExtract, K>, U>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryObjectIncludeParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterExtract, K>, U>>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U>): Promise<Array<MergeIncludes<Omit<FighterExtract, K>, U>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterExtract, K>, U>>>>;
  extract<K extends keyof FighterExtract>(query: ComplexSqlQueryValueParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract>): Promise<Array<FighterExtract[K]>>;
  extract<K extends keyof FighterExtract>(query: ComplexSqlQueryValueParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract>): Promise<DebugResult<Array<FighterExtract[K]>>>;
  extract<N>(query: ComplexSqlQuerySelectorParams<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, N>): Promise<Array<N>>;
  extract<N>(query: ComplexSqlQuerySelectorParamsDebug<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, N>): Promise<DebugResult<Array<N>>>;
  filter<U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryInclude<ToWhere<FighterFilter>, FighterFilter, U>): Promise<Array<MergeIncludes<FighterFilter, U>>>;
  filter<U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterFilter>, FighterFilter, U>): Promise<DebugResult<Array<MergeIncludes<FighterFilter, U>>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterFilter>, K, FighterFilter, U>): Promise<Array<MergeIncludes<Pick<FighterFilter, K>, U>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterFilter>, K, FighterFilter, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterFilter, K>, U>>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterFilter>, K, FighterFilter, U>): Promise<Array<MergeIncludes<Omit<FighterFilter, K>, U>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterFilter>, K, FighterFilter, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterFilter, K>, U>>>>;
  filter<K extends keyof FighterFilter>(query: ComplexSqlQueryValue<ToWhere<FighterFilter>, K, FighterFilter>): Promise<Array<FighterFilter[K]>>;
  filter<K extends keyof FighterFilter>(query: ComplexSqlQueryValueDebug<ToWhere<FighterFilter>, K, FighterFilter>): Promise<DebugResult<Array<FighterFilter[K]>>>;
  filter<N>(query: ComplexSqlQuerySelector<ToWhere<FighterFilter>, FighterFilter, N>): Promise<Array<N>>;
  filter<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterFilter>, FighterFilter, N>): Promise<DebugResult<Array<N>>>;
  instagram<U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryInclude<ToWhere<FighterInstagram>, FighterInstagram, U>): Promise<Array<MergeIncludes<FighterInstagram, U>>>;
  instagram<U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterInstagram>, FighterInstagram, U>): Promise<DebugResult<Array<MergeIncludes<FighterInstagram, U>>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterInstagram>, K, FighterInstagram, U>): Promise<Array<MergeIncludes<Pick<FighterInstagram, K>, U>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterInstagram>, K, FighterInstagram, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterInstagram, K>, U>>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterInstagram>, K, FighterInstagram, U>): Promise<Array<MergeIncludes<Omit<FighterInstagram, K>, U>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterInstagram>, K, FighterInstagram, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterInstagram, K>, U>>>>;
  instagram<K extends keyof FighterInstagram>(query: ComplexSqlQueryValue<ToWhere<FighterInstagram>, K, FighterInstagram>): Promise<Array<FighterInstagram[K]>>;
  instagram<K extends keyof FighterInstagram>(query: ComplexSqlQueryValueDebug<ToWhere<FighterInstagram>, K, FighterInstagram>): Promise<DebugResult<Array<FighterInstagram[K]>>>;
  instagram<N>(query: ComplexSqlQuerySelector<ToWhere<FighterInstagram>, FighterInstagram, N>): Promise<Array<N>>;
  instagram<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterInstagram>, FighterInstagram, N>): Promise<DebugResult<Array<N>>>;
  lastFights<U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryIncludeParams<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, U>): Promise<Array<MergeIncludes<FighterLastFights, U>>>;
  lastFights<U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryIncludeParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, U>): Promise<DebugResult<Array<MergeIncludes<FighterLastFights, U>>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryObjectIncludeParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U>): Promise<Array<MergeIncludes<Pick<FighterLastFights, K>, U>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryObjectIncludeParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterLastFights, K>, U>>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U>): Promise<Array<MergeIncludes<Omit<FighterLastFights, K>, U>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterLastFights, K>, U>>>>;
  lastFights<K extends keyof FighterLastFights>(query: ComplexSqlQueryValueParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights>): Promise<Array<FighterLastFights[K]>>;
  lastFights<K extends keyof FighterLastFights>(query: ComplexSqlQueryValueParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights>): Promise<DebugResult<Array<FighterLastFights[K]>>>;
  lastFights<N>(query: ComplexSqlQuerySelectorParams<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, N>): Promise<Array<N>>;
  lastFights<N>(query: ComplexSqlQuerySelectorParamsDebug<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, N>): Promise<DebugResult<Array<N>>>;
  left<U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryInclude<ToWhere<FighterLeft>, FighterLeft, U>): Promise<Array<MergeIncludes<FighterLeft, U>>>;
  left<U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterLeft>, FighterLeft, U>): Promise<DebugResult<Array<MergeIncludes<FighterLeft, U>>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterLeft>, K, FighterLeft, U>): Promise<Array<MergeIncludes<Pick<FighterLeft, K>, U>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterLeft>, K, FighterLeft, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterLeft, K>, U>>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterLeft>, K, FighterLeft, U>): Promise<Array<MergeIncludes<Omit<FighterLeft, K>, U>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterLeft>, K, FighterLeft, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterLeft, K>, U>>>>;
  left<K extends keyof FighterLeft>(query: ComplexSqlQueryValue<ToWhere<FighterLeft>, K, FighterLeft>): Promise<Array<FighterLeft[K]>>;
  left<K extends keyof FighterLeft>(query: ComplexSqlQueryValueDebug<ToWhere<FighterLeft>, K, FighterLeft>): Promise<DebugResult<Array<FighterLeft[K]>>>;
  left<N>(query: ComplexSqlQuerySelector<ToWhere<FighterLeft>, FighterLeft, N>): Promise<Array<N>>;
  left<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterLeft>, FighterLeft, N>): Promise<DebugResult<Array<N>>>;
  methods<U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryIncludeParams<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, U>): Promise<Array<MergeIncludes<FighterMethods, U>>>;
  methods<U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryIncludeParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, U>): Promise<DebugResult<Array<MergeIncludes<FighterMethods, U>>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryObjectIncludeParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U>): Promise<Array<MergeIncludes<Pick<FighterMethods, K>, U>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryObjectIncludeParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterMethods, K>, U>>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U>): Promise<Array<MergeIncludes<Omit<FighterMethods, K>, U>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterMethods, K>, U>>>>;
  methods<K extends keyof FighterMethods>(query: ComplexSqlQueryValueParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods>): Promise<Array<FighterMethods[K]>>;
  methods<K extends keyof FighterMethods>(query: ComplexSqlQueryValueParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods>): Promise<DebugResult<Array<FighterMethods[K]>>>;
  methods<N>(query: ComplexSqlQuerySelectorParams<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, N>): Promise<Array<N>>;
  methods<N>(query: ComplexSqlQuerySelectorParamsDebug<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, N>): Promise<DebugResult<Array<N>>>;
  opponents<U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryInclude<ToWhere<FighterOpponents>, FighterOpponents, U>): Promise<Array<MergeIncludes<FighterOpponents, U>>>;
  opponents<U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterOpponents>, FighterOpponents, U>): Promise<DebugResult<Array<MergeIncludes<FighterOpponents, U>>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterOpponents>, K, FighterOpponents, U>): Promise<Array<MergeIncludes<Pick<FighterOpponents, K>, U>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterOpponents>, K, FighterOpponents, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterOpponents, K>, U>>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterOpponents>, K, FighterOpponents, U>): Promise<Array<MergeIncludes<Omit<FighterOpponents, K>, U>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterOpponents>, K, FighterOpponents, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterOpponents, K>, U>>>>;
  opponents<K extends keyof FighterOpponents>(query: ComplexSqlQueryValue<ToWhere<FighterOpponents>, K, FighterOpponents>): Promise<Array<FighterOpponents[K]>>;
  opponents<K extends keyof FighterOpponents>(query: ComplexSqlQueryValueDebug<ToWhere<FighterOpponents>, K, FighterOpponents>): Promise<DebugResult<Array<FighterOpponents[K]>>>;
  opponents<N>(query: ComplexSqlQuerySelector<ToWhere<FighterOpponents>, FighterOpponents, N>): Promise<Array<N>>;
  opponents<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterOpponents>, FighterOpponents, N>): Promise<DebugResult<Array<N>>>;
  otherNames<U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryInclude<ToWhere<FighterOtherNames>, FighterOtherNames, U>): Promise<Array<MergeIncludes<FighterOtherNames, U>>>;
  otherNames<U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterOtherNames>, FighterOtherNames, U>): Promise<DebugResult<Array<MergeIncludes<FighterOtherNames, U>>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterOtherNames>, K, FighterOtherNames, U>): Promise<Array<MergeIncludes<Pick<FighterOtherNames, K>, U>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterOtherNames>, K, FighterOtherNames, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterOtherNames, K>, U>>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterOtherNames>, K, FighterOtherNames, U>): Promise<Array<MergeIncludes<Omit<FighterOtherNames, K>, U>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterOtherNames>, K, FighterOtherNames, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterOtherNames, K>, U>>>>;
  otherNames<K extends keyof FighterOtherNames>(query: ComplexSqlQueryValue<ToWhere<FighterOtherNames>, K, FighterOtherNames>): Promise<Array<FighterOtherNames[K]>>;
  otherNames<K extends keyof FighterOtherNames>(query: ComplexSqlQueryValueDebug<ToWhere<FighterOtherNames>, K, FighterOtherNames>): Promise<DebugResult<Array<FighterOtherNames[K]>>>;
  otherNames<N>(query: ComplexSqlQuerySelector<ToWhere<FighterOtherNames>, FighterOtherNames, N>): Promise<Array<N>>;
  otherNames<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterOtherNames>, FighterOtherNames, N>): Promise<DebugResult<Array<N>>>;
  right<U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryInclude<ToWhere<FighterRight>, FighterRight, U>): Promise<Array<MergeIncludes<FighterRight, U>>>;
  right<U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterRight>, FighterRight, U>): Promise<DebugResult<Array<MergeIncludes<FighterRight, U>>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterRight>, K, FighterRight, U>): Promise<Array<MergeIncludes<Pick<FighterRight, K>, U>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterRight>, K, FighterRight, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterRight, K>, U>>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterRight>, K, FighterRight, U>): Promise<Array<MergeIncludes<Omit<FighterRight, K>, U>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterRight>, K, FighterRight, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterRight, K>, U>>>>;
  right<K extends keyof FighterRight>(query: ComplexSqlQueryValue<ToWhere<FighterRight>, K, FighterRight>): Promise<Array<FighterRight[K]>>;
  right<K extends keyof FighterRight>(query: ComplexSqlQueryValueDebug<ToWhere<FighterRight>, K, FighterRight>): Promise<DebugResult<Array<FighterRight[K]>>>;
  right<N>(query: ComplexSqlQuerySelector<ToWhere<FighterRight>, FighterRight, N>): Promise<Array<N>>;
  right<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<FighterRight>, FighterRight, N>): Promise<DebugResult<Array<N>>>;
  weightClasses<U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryIncludeParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, U>): Promise<Array<MergeIncludes<FighterWeightClasses, U>>>;
  weightClasses<U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryIncludeParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, U>): Promise<DebugResult<Array<MergeIncludes<FighterWeightClasses, U>>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U>): Promise<Array<MergeIncludes<Pick<FighterWeightClasses, K>, U>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterWeightClasses, K>, U>>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U>): Promise<Array<MergeIncludes<Omit<FighterWeightClasses, K>, U>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterWeightClasses, K>, U>>>>;
  weightClasses<K extends keyof FighterWeightClasses>(query: ComplexSqlQueryValueParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses>): Promise<Array<FighterWeightClasses[K]>>;
  weightClasses<K extends keyof FighterWeightClasses>(query: ComplexSqlQueryValueParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses>): Promise<DebugResult<Array<FighterWeightClasses[K]>>>;
  weightClasses<N>(query: ComplexSqlQuerySelectorParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, N>): Promise<Array<N>>;
  weightClasses<N>(query: ComplexSqlQuerySelectorParamsDebug<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, N>): Promise<DebugResult<Array<N>>>;
  withReach<U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryInclude<ToWhere<FighterWithReach>, FighterWithReach, U>): Promise<Array<MergeIncludes<FighterWithReach, U>>>;
  withReach<U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryIncludeDebug<ToWhere<FighterWithReach>, FighterWithReach, U>): Promise<DebugResult<Array<MergeIncludes<FighterWithReach, U>>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterWithReach>, K, FighterWithReach, U>): Promise<Array<MergeIncludes<Pick<FighterWithReach, K>, U>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<FighterWithReach>, K, FighterWithReach, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FighterWithReach, K>, U>>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterWithReach>, K, FighterWithReach, U>): Promise<Array<MergeIncludes<Omit<FighterWithReach, K>, U>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<FighterWithReach>, K, FighterWithReach, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FighterWithReach, K>, U>>>>;
  withReach<K extends keyof FighterWithReach>(query: ComplexSqlQueryValue<ToWhere<FighterWithReach>, K, FighterWithReach>): Promise<Array<FighterWithReach[K]>>;
  withReach<K extends keyof FighterWithReach>(query: ComplexSqlQueryValueDebug<ToWhere<FighterWithReach>, K, FighterWithReach>): Promise<DebugResult<Array<FighterWithReach[K]>>>;
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
  byFighter<U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryIncludeParams<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, U>): Promise<Array<MergeIncludes<MethodByFighter, U>>>;
  byFighter<U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryIncludeParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, U>): Promise<DebugResult<Array<MergeIncludes<MethodByFighter, U>>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryObjectIncludeParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U>): Promise<Array<MergeIncludes<Pick<MethodByFighter, K>, U>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryObjectIncludeParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U>): Promise<DebugResult<Array<MergeIncludes<Pick<MethodByFighter, K>, U>>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryObjectIncludeOmitParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U>): Promise<Array<MergeIncludes<Omit<MethodByFighter, K>, U>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U>): Promise<DebugResult<Array<MergeIncludes<Omit<MethodByFighter, K>, U>>>>;
  byFighter<K extends keyof MethodByFighter>(query: ComplexSqlQueryValueParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter>): Promise<Array<MethodByFighter[K]>>;
  byFighter<K extends keyof MethodByFighter>(query: ComplexSqlQueryValueParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter>): Promise<DebugResult<Array<MethodByFighter[K]>>>;
  byFighter<N>(query: ComplexSqlQuerySelectorParams<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, N>): Promise<Array<N>>;
  byFighter<N>(query: ComplexSqlQuerySelectorParamsDebug<MethodByFighterParams, ToWhere<MethodByFighter>, MethodByFighter, N>): Promise<DebugResult<Array<N>>>;
  coach<U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryInclude<ToWhere<MethodCoach>, MethodCoach, U>): Promise<Array<MergeIncludes<MethodCoach, U>>>;
  coach<U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryIncludeDebug<ToWhere<MethodCoach>, MethodCoach, U>): Promise<DebugResult<Array<MergeIncludes<MethodCoach, U>>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryObjectInclude<ToWhere<MethodCoach>, K, MethodCoach, U>): Promise<Array<MergeIncludes<Pick<MethodCoach, K>, U>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<MethodCoach>, K, MethodCoach, U>): Promise<DebugResult<Array<MergeIncludes<Pick<MethodCoach, K>, U>>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<MethodCoach>, K, MethodCoach, U>): Promise<Array<MergeIncludes<Omit<MethodCoach, K>, U>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<MethodCoach>, K, MethodCoach, U>): Promise<DebugResult<Array<MergeIncludes<Omit<MethodCoach, K>, U>>>>;
  coach<K extends keyof MethodCoach>(query: ComplexSqlQueryValue<ToWhere<MethodCoach>, K, MethodCoach>): Promise<Array<MethodCoach[K]>>;
  coach<K extends keyof MethodCoach>(query: ComplexSqlQueryValueDebug<ToWhere<MethodCoach>, K, MethodCoach>): Promise<DebugResult<Array<MethodCoach[K]>>>;
  coach<N>(query: ComplexSqlQuerySelector<ToWhere<MethodCoach>, MethodCoach, N>): Promise<Array<N>>;
  coach<N>(query: ComplexSqlQuerySelectorDebug<ToWhere<MethodCoach>, MethodCoach, N>): Promise<DebugResult<Array<N>>>;
  topSubmission<U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryInclude<ToWhere<MethodTopSubmission>, MethodTopSubmission, U>): Promise<Array<MergeIncludes<MethodTopSubmission, U>>>;
  topSubmission<U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryIncludeDebug<ToWhere<MethodTopSubmission>, MethodTopSubmission, U>): Promise<DebugResult<Array<MergeIncludes<MethodTopSubmission, U>>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryObjectInclude<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U>): Promise<Array<MergeIncludes<Pick<MethodTopSubmission, K>, U>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryObjectIncludeDebug<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U>): Promise<DebugResult<Array<MergeIncludes<Pick<MethodTopSubmission, K>, U>>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U>): Promise<Array<MergeIncludes<Omit<MethodTopSubmission, K>, U>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryObjectIncludeOmitDebug<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U>): Promise<DebugResult<Array<MergeIncludes<Omit<MethodTopSubmission, K>, U>>>>;
  topSubmission<K extends keyof MethodTopSubmission>(query: ComplexSqlQueryValue<ToWhere<MethodTopSubmission>, K, MethodTopSubmission>): Promise<Array<MethodTopSubmission[K]>>;
  topSubmission<K extends keyof MethodTopSubmission>(query: ComplexSqlQueryValueDebug<ToWhere<MethodTopSubmission>, K, MethodTopSubmission>): Promise<DebugResult<Array<MethodTopSubmission[K]>>>;
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
  byFighter<U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryIncludeParams<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter, U>): Promise<Array<MergeIncludes<FightByFighter, U>>>;
  byFighter<U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryIncludeParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, FightByFighter, U>): Promise<DebugResult<Array<MergeIncludes<FightByFighter, U>>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryObjectIncludeParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U>): Promise<Array<MergeIncludes<Pick<FightByFighter, K>, U>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryObjectIncludeParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U>): Promise<DebugResult<Array<MergeIncludes<Pick<FightByFighter, K>, U>>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryObjectIncludeOmitParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U>): Promise<Array<MergeIncludes<Omit<FightByFighter, K>, U>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryObjectIncludeOmitParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U>): Promise<DebugResult<Array<MergeIncludes<Omit<FightByFighter, K>, U>>>>;
  byFighter<K extends keyof FightByFighter>(query: ComplexSqlQueryValueParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter>): Promise<Array<FightByFighter[K]>>;
  byFighter<K extends keyof FightByFighter>(query: ComplexSqlQueryValueParamsDebug<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter>): Promise<DebugResult<Array<FightByFighter[K]>>>;
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
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  getTransaction(type: ('read' | 'write' | 'deferred')): Promise<TypedDb>;
  batch:<T extends any[]> (batcher: (bx: TypedDb) => T) => Promise<Unwrap<T>>;
  sync(): Promise<void>;
}

export interface Config {
    url: string;
    authToken?: string;
    encryptionKey?: string;
    syncUrl?: string;
    syncInterval?: number;
    tls?: boolean;
    intMode?: 'number' | 'bigint' | 'string';
    fetch?: Function;
    concurrency?: number | undefined;
}

export function makeClient(options: Config, internal?: boolean): TypedDb;
