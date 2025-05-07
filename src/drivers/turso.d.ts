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
  with?: undefined;
}

export interface ComplexQueryDebug<W, T> extends ComplexQuery<W, T> {
  debug: true;
}

export interface ComplexQueryAlias<W, T, N extends ObjectFunction> extends Keywords<Array<keyof T | ExtractKeys<N>> | keyof T | ExtractKeys<N>> {
  where?: W | Partial<TransformAlias<N>>;
  select?: undefined;
  include?: undefined;
  alias: N;
  with?: undefined;
}

export interface ComplexQueryAliasDebug<W, T, N> extends ComplexQueryAlias<W, T, N> {
  debug: true;
}

export interface ComplexQueryInclude<W, T, U extends ObjectFunction> extends Keywords<Array<keyof T | ExtractKeys<U>> | keyof T | ExtractKeys<U>> {
  where?: W | Partial<IncludeWhere<U>>;
  select?: undefined;
  include: U;
  alias?: undefined;
  with?: undefined;
}

export interface ComplexQueryIncludeDebug<W, T, U extends ObjectFunction> extends ComplexQueryInclude<W, T, U> {
  debug: true;
}

export interface ComplexQueryIncludeAlias<W, T, U extends ObjectFunction, N extends ObjectFunction> extends Keywords<Array<keyof T | ExtractKeys<U & N>> | keyof T | ExtractKeys<U & N>> {
  where?: W | Partial<IncludeWhere<U>> | Partial<TransformAlias<N>>;
  select?: undefined;
  include: U;
  alias: N;
  with?: undefined;
}

export interface ComplexQueryIncludeAliasDebug<W, T, U extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryIncludeAlias<W, T, U, N> {
  debug: true;
}

export interface ComplexQueryAlias<W, T, N> extends Keywords<Array<keyof T | ExtractKeys<N>> | keyof T | ExtractKeys<N>> {
  where?: W | Partial<TransformAlias<N>>;
  select?: undefined;
  include?: undefined;
  alias: N;
  with?: undefined;
}

export interface ComplexQueryAliasDebug<W, T, N extends ObjectFunction> extends ComplexQueryAlias<W, T, N> {
  debug: true;
}

export interface ComplexQueryObject<W, K, T> extends Keywords<keyof T | Array<keyof T>> {
  where?: W;
  select: (keyof T)[] | K[];
  include?: undefined;
  alias?: undefined;
  with?: undefined;
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
  with?: undefined;
}

export interface ComplexQueryObjectOmitDebug<W, K, T> extends ComplexQueryObjectOmit<W, K, T> {
  debug: true;
}

export interface ComplexQueryObjectAlias<W, K, T, N extends ObjectFunction> extends Keywords<keyof T | ExtractKeys<N> | Array<keyof T | ExtractKeys<N>>> {
  where?: W | Partial<TransformAlias<N>>;
  select: (keyof T)[] | K[];
  include?: undefined;
  alias: N;
  with?: undefined;
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
  with?: undefined;
}

export interface ComplexQueryObjectAliasOmitDebug<W, K, T, N extends ObjectFunction> extends ComplexQueryObjectAliasOmit<W, K, T, N> {
  debug: true;
}

export interface ComplexQueryObjectInclude<W, K, T, U extends ObjectFunction> extends Keywords<keyof T | ExtractKeys<U> | Array<keyof T | ExtractKeys<U>>> {
  where?: W | Partial<IncludeWhere<U>>;
  select: (keyof T)[] | K[];
  include: U;
  alias?: undefined;
  with?: undefined;
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
  with?: undefined;
}

export interface ComplexQueryObjectIncludeOmitDebug<W, K, T, U extends ObjectFunction> extends ComplexQueryObjectIncludeOmit<W, K, T, U> {
  debug: true;
}

export interface ComplexQueryObjectIncludeAlias<W, K, T, U extends ObjectFunction, N extends ObjectFunction> extends Keywords<keyof T | ExtractKeys<U & N> | Array<keyof T | ExtractKeys<U & N>>> {
  where?: W | Partial<IncludeWhere<U>> | Partial<TransformAlias<N>>;
  select: (keyof T)[] | K[];
  include: U;
  alias: N;
  with?: undefined;
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
  with?: undefined;
}

export interface ComplexQueryObjectIncludeAliasOmitDebug<W, K, T, U extends ObjectFunction, N extends ObjectFunction> extends ComplexQueryObjectIncludeAliasOmit<W, K, T, U, N> {
  debug: true;
}

export interface ComplexQueryValue<W, K, T> extends Keywords<Array<keyof T> | keyof T> {
  where?: W;
  select: K;
}

export interface ComplexQueryValueDebug<W, K, T> extends ComplexQueryValue<W, K, T> {
  debug: true;
}

export interface ComplexQuerySelector<W, T, N> extends Keywords<Array<keyof T> | keyof T> {
  where?: W;
  select: (selector: T) => N;
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

export interface LocationQueries {
  byId(params: { id: any; }): Promise<Array<LocationById>>;
  byMethod(params: { id: any; }): Promise<Array<LocationByMethod>>;
  detailedEvents(): Promise<Array<LocationDetailedEvents>>;
  events(): Promise<Array<LocationEvents>>;
  winners(): Promise<Array<LocationWinners>>;
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

export interface EventLag {
  test1: number | null;
  test2: number | null;
  test3: number | null;
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
  from(): Promise<Array<number | null>>;
  lag(): Promise<Array<EventLag>>;
  operator(): Promise<Array<number>>;
  spaces(): Promise<Array<EventSpaces>>;
  test(): Promise<Array<EventTest>>;
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

export interface CoachQueries {
  from(): Promise<Array<number>>;
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

export interface FighterFilter {
  name: string;
  reaches: string | null;
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

export interface FighterQueries {
  byHeight(): Promise<Array<FighterByHeight>>;
  common(params: { fighter1: any; fighter2: any; }): Promise<Array<FighterCommon>>;
  extract(params: { path: any; }): Promise<Array<number | string | Buffer | null>>;
  filter(): Promise<Array<FighterFilter>>;
  instagram(): Promise<Array<number | string | Buffer>>;
  lastFights(params: { id: any; }): Promise<Array<FighterLastFights>>;
  left(): Promise<Array<FighterLeft>>;
  methods(params: { id: any; }): Promise<Array<FighterMethods>>;
  opponents(): Promise<Array<FighterOpponents>>;
  otherNames(): Promise<Array<FighterOtherNames>>;
  right(): Promise<Array<FighterRight>>;
  weightClasses(params: { fighterId: any; }): Promise<Array<FighterWeightClasses>>;
  withReach(): Promise<Array<FighterWithReach>>;
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

export interface MethodQueries {
  byFighter(params: { fighterId: any; }): Promise<Array<MethodByFighter>>;
  coach(): Promise<Array<MethodCoach>>;
  topSubmission(): Promise<Array<string | null>>;
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

export interface FightQueries {
  byFighter(params: { id: any; }): Promise<Array<FightByFighter>>;
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
