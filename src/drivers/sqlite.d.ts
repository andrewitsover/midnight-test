interface QueryOptions {
  parse: boolean;
}

interface DatabaseConfig {
  debug?: boolean;
}

interface SQLiteConfig extends DatabaseConfig {
  db: string | URL;
  paths: SQLitePaths;
  adaptor: any;
}

interface TursoConfig extends DatabaseConfig {
  db: any;
  paths: Paths;
  adaptor: any;
}

interface FileSystem {
  readFile: (path: string, encoding: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  readdir: (path: string) => Promise<string[]>;
  join: (...paths: string[]) => string;
  readSql: (path: string) => Promise<string>;
}

interface Paths {
  tables: string | URL;
  views: string | URL;
  sql: string | URL;
  types: string | URL;
  migrations: string | URL;
  computed: string | URL;
}

interface SQLitePaths extends Paths {
  db: string | URL;
  extensions?: string | URL | Array<string | URL>;
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
  close(): Promise<void>;
}

export class SQLiteDatabase extends Database {
  constructor(options: SQLiteConfig);
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export class TursoDatabase extends Database {
  constructor(options: TursoConfig);
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  batch(handler: (batcher: any) => any[]): Promise<any[]>;
}

type ExtractKeys<U> = U extends Record<string, any> ? keyof U : keyof {};

interface Keywords<T, K> {
  orderBy?: K | ((method: ComputeMethods, column: T) => void);
  desc?: boolean;
  limit?: number;
  offset?: number;
  distinct?: boolean;
}

interface Includes<T, R> {
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

interface VirtualKeywords<T> {
  rank?: true;
  bm25?: Record<keyof Omit<T, "rowid">, number>;
  limit?: number;
  offset?: number;
}

interface Highlight<T> extends VirtualKeywords<T> {
  highlight: { column: keyof T, tags: [string, string] };
}

interface Snippet<T> extends VirtualKeywords<T> {
  snippet: { column: keyof T, tags: [string, string], trailing: string, tokens: number };
}

interface HighlightQuery<W, T> extends Highlight<T> {
  where?: W;
}

interface SnippetQuery<W, T> extends Snippet<T> {
  where?: W;
}

interface VirtualQuery<W, T> extends VirtualKeywords<T> {
  where?: W;
}

interface VirtualQueryObject<W, K, T> extends VirtualQuery<W, T> {
  select: (keyof T)[] | K[];
}

interface VirtualQueryValue<W, K, T> extends VirtualQuery<W, T> {
  select: K;
}

interface AggregateQuery<W, K> {
  where?: W;
  column?: K;
  distinct?: K;
}

interface AggregateQueryDebug<W, K> extends AggregateQuery<W, K> {
  debug: true;
}

interface GroupQueryObjectDebug<T, W, K, U> extends GroupQueryObject<T, W, K, U> {
  debug: true;
}

interface GroupQueryObjectAliasDebug<T, W, K, U, A> extends GroupQueryObjectAlias<T, W, K, U, A> {
  debug: true;
}

interface ComplexQueryInclude<W, T, U extends ObjectFunction, C> extends Keywords<T & C, Array<keyof (T & C)> | keyof (T & C)> {
  where?: W;
  select?: undefined;
  include?: U;
}

interface ComplexSqlQueryIncludeParamsUnsafe<P, U, W, T, R extends ObjectFunction> extends ComplexQueryInclude<W, T, R, unknown> {
  params: P;
  unsafe: U;
}

interface ComplexSqlQueryIncludeParams<P, W, T, R extends ObjectFunction> extends ComplexQueryInclude<W, T, R, unknown> {
  params: P;
  unsafe?: undefined;
}

interface ComplexSqlQueryIncludeUnsafe<U, W, T, R extends ObjectFunction> extends ComplexQueryInclude<W, T, R, unknown> {
  params?: undefined;
  unsafe: U;
}

interface ComplexSqlQueryInclude<W, T, R extends ObjectFunction> extends ComplexQueryInclude<W, T, R, unknown> {
  params?: undefined;
  unsafe?: undefined;
}

interface ComplexSqlQueryIncludeParamsUnsafeDebug<P, U, W, T, R extends ObjectFunction> extends ComplexSqlQueryIncludeParamsUnsafe<P, U, W, T, R> {
  debug: true;
}

interface ComplexSqlQueryIncludeParamsDebug<P, W, T, R extends ObjectFunction> extends ComplexSqlQueryIncludeParams<P, W, T, R> {
  debug: true;
}

interface ComplexSqlQueryIncludeUnsafeDebug<U, W, T, R extends ObjectFunction> extends ComplexSqlQueryIncludeUnsafe<U, W, T, R> {
  debug: true;
}

interface ComplexSqlQueryIncludeDebug<W, T, R extends ObjectFunction> extends ComplexSqlQueryInclude<W, T, R> {
  debug: true;
}

interface ComplexQueryIncludeDebug<W, T, U extends ObjectFunction, C> extends ComplexQueryInclude<W, T, U, C> {
  debug: true;
}

interface ComplexQueryObjectInclude<W, K, T, U extends ObjectFunction, C> extends Keywords<T & C, keyof (T & C) | Array<keyof (T & C)>> {
  where?: W;
  select: (keyof (T & C))[] | K[];
  include?: U;
}

interface ComplexSqlQueryObjectIncludeParamsUnsafe<P, U, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectInclude<W, K, T, R, unknown> {
  params: P;
  unsafe: U;
}

interface ComplexSqlQueryObjectIncludeParams<P, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectInclude<W, K, T, R, unknown> {
  params: P;
  unsafe?: undefined;
}

interface ComplexSqlQueryObjectIncludeUnsafe<U, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectInclude<W, K, T, R, unknown> {
  params?: undefined;
  unsafe: U;
}

interface ComplexSqlQueryObjectInclude<W, K, T, R extends ObjectFunction> extends ComplexQueryObjectInclude<W, K, T, R, unknown> {
  params?: undefined;
  unsafe?: undefined;
}

interface ComplexSqlQueryObjectIncludeParamsUnsafeDebug<P, U, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeParamsUnsafe<P, U, W, K, T, R> {
  debug: true;
}

interface ComplexSqlQueryObjectIncludeParamsDebug<P, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeParams<P, W, K, T, R> {
  debug: true;
}

interface ComplexSqlQueryObjectIncludeUnsafeDebug<U, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeUnsafe<U, W, K, T, R> {
  debug: true;
}

interface ComplexSqlQueryObjectIncludeDebug<W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectInclude<W, K, T, R> {
  debug: true;
}

interface ComplexQueryObjectIncludeDebug<W, K, T, U extends ObjectFunction, C> extends ComplexQueryObjectInclude<W, K, T, U, C> {
  debug: true;
}

interface ComplexQueryObjectIncludeOmit<W, K, T, U extends ObjectFunction, C> extends Keywords<T & C, keyof (T & C) | Array<keyof (T & C)>> {
  where?: W;
  select?: undefined;
  omit: (keyof T)[] | K[] | K;
  include?: U;
}

interface ComplexSqlQueryObjectIncludeOmitParamsUnsafe<P, U, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectIncludeOmit<W, K, T, R, unknown> {
  params: P;
  unsafe: U;
}

interface ComplexSqlQueryObjectIncludeOmitParams<P, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectIncludeOmit<W, K, T, R, unknown> {
  params: P;
  unsafe?: undefined;
}

interface ComplexSqlQueryObjectIncludeOmitUnsafe<U, W, K, T, R extends ObjectFunction> extends ComplexQueryObjectIncludeOmit<W, K, T, R, unknown> {
  params?: undefined;
  unsafe: U;
}

interface ComplexSqlQueryObjectIncludeOmit<W, K, T, R extends ObjectFunction> extends ComplexQueryObjectIncludeOmit<W, K, T, R, unknown> {
  params?: undefined;
  unsafe?: undefined;
}

interface ComplexSqlQueryObjectIncludeOmitParamsUnsafeDebug<P, U, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeOmitParamsUnsafe<P, U, W, K, T, R> {
  debug: true;
}

interface ComplexSqlQueryObjectIncludeOmitParamsDebug<P, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeOmitParams<P, W, K, T, R> {
  debug: true;
}

interface ComplexSqlQueryObjectIncludeOmitUnsafeDebug<U, W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeOmitUnsafe<U, W, K, T, R> {
  debug: true;
}

interface ComplexSqlQueryObjectIncludeOmitDebug<W, K, T, R extends ObjectFunction> extends ComplexSqlQueryObjectIncludeOmit<W, K, T, R> {
  debug: true;
}

interface ComplexQueryObjectIncludeOmitDebug<W, K, T, U extends ObjectFunction, C> extends ComplexQueryObjectIncludeOmit<W, K, T, U, C> {
  debug: true;
}

interface ComplexQueryValue<W, K, T, C> extends Keywords<T & C, Array<keyof (T & C)> | keyof (T & C)> {
  where?: W;
  select: K;
  omit?: undefined;
  include?: undefined;
}

interface ComplexSqlQueryValueParamsUnsafe<P, U, W, K, T> extends ComplexQueryValue<W, K, T, unknown> {
  params: P;
  unsafe: U;
}

interface ComplexSqlQueryValueParams<P, W, K, T> extends ComplexQueryValue<W, K, T, unknown> {
  params: P;
  unsafe?: undefined;
}

interface ComplexSqlQueryValueUnsafe<U, W, K, T> extends ComplexQueryValue<W, K, T, unknown> {
  params?: undefined;
  unsafe: U;
}

interface ComplexSqlQueryValue<W, K, T> extends ComplexQueryValue<W, K, T, unknown> {
  params?: undefined;
  unsafe?: undefined;
}

interface ComplexSqlQueryValueParamsUnsafeDebug<P, U, W, K, T> extends ComplexSqlQueryValueParamsUnsafe<P, U, W, K, T> {
  debug: true;
}

interface ComplexSqlQueryValueParamsDebug<P, W, K, T> extends ComplexSqlQueryValueParams<P, W, K, T> {
  debug: true;
}

interface ComplexSqlQueryValueUnsafeDebug<U, W, K, T> extends ComplexSqlQueryValueUnsafe<U, W, K, T> {
  debug: true;
}

interface ComplexSqlQueryValueDebug<W, K, T> extends ComplexSqlQueryValue<W, K, T> {
  debug: true;
}

interface ComplexQueryValueDebug<W, K, T, C> extends ComplexQueryValue<W, K, T, C> {
  debug: true;
}

type MakeOptionalNullable<T> = {
  [K in keyof T]: undefined extends T[K] ? T[K] | null : T[K];
};

interface UpdateQuery<W, T> {
  where?: W | null;
  set: Partial<MakeOptionalNullable<T>>;
}

interface UpsertQuery<T, K> {
  values: T;
  target?: K;
  set?: Partial<MakeOptionalNullable<T>>;
}

interface DebugQuery {
  sql: string;
  params?: any;
}

interface DebugResult<R> {
  result: R;
  queries: Array<DebugQuery>;
}

interface GroupQueryObject<T, W, K, U> {
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

interface GroupQueryObjectAlias<T, W, K, U, A> {
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

interface GroupArrayKeywords<T, W, K, U> {
  where?: W;
  column?: keyof T;
  distinct?: keyof T;
  orderBy?: K;
  desc?: boolean;
  limit?: number;
  offset?: number;
  include?: U;
}

interface GroupArray<T, W, K, U> extends GroupArrayKeywords<T, W, K, U> {
  select?: undefined;
  alias?: undefined;
}

interface GroupArrayAlias<T, W, K, U, A> extends GroupArrayKeywords<T, W, K, U> {
  select?: undefined;
  alias: A;
}

interface GroupArraySelect<T, W, K, U, S> extends GroupArrayKeywords<T, W, K, U> {
  select: S[];
  alias?: undefined;
}

interface GroupArraySelectAlias<T, W, K, U, A, S> extends GroupArrayKeywords<T, W, K, U> {
  select: S[];
  alias: A;
}

interface GroupArrayValue<T, W, K, U, S> extends GroupArrayKeywords<T, W, K, U> {
  select: S;
  alias?: undefined;
}

interface GroupArrayValueAlias<T, W, K, U, A, S> extends GroupArrayKeywords<T, W, K, U> {
  select: S;
  alias: A;
}

interface AggregateMethods<T, W, C, K extends keyof (T & C), Y> {
  count<U extends Includes<Y, (Pick<(T & C), K> & { count: number })>>(params?: GroupQueryObject<T, W & ToWhere<{ count: number }>, K | 'count', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { count: number }, U>>>;
  count<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { count: number })>>(params?: GroupQueryObjectAlias<T, W & ToWhere<{ count: number }>, K | 'count', U, A>): Promise<Array<MergeIncludes<Pick<(T & C), K> & Record<A, number>, U>>>;
  avg<U extends Includes<Y, (Pick<(T & C), K> & { avg: number })>>(params: GroupQueryObject<T, W & ToWhere<{ avg: number }>, K | 'avg', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { avg: number }, U>>>;
  avg<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { avg: number })>>(params: GroupQueryObjectAlias<T, W & ToWhere<{ avg: number }>, K | 'avg', U, A>): Promise<Array<MergeIncludes<Pick<(T & C), K> & Record<A, number>, U>>>;
  max<U extends Includes<Y, (Pick<(T & C), K> & { min: number })>>(params: GroupQueryObject<T, W & ToWhere<{ max: number }>, K | 'max', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { max: number }, U>>>;
  max<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { min: number })>>(params: GroupQueryObjectAlias<T, W & ToWhere<{ max: number }>, K | 'max', U, A>): Promise<Array<MergeIncludes<Pick<(T & C), K> & Record<A, number>, U>>>;
  min<U extends Includes<Y, (Pick<(T & C), K> & { max: number })>>(params: GroupQueryObject<T, W & ToWhere<{ min: number }>, K | 'min', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { min: number }, U>>>;
  min<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { max: number })>>(params: GroupQueryObjectAlias<T, W & ToWhere<{ min: number }>, K | 'min', U, A>): Promise<Array<MergeIncludes<Pick<(T & C), K> & Record<A, number>, U>>>;
  sum<U extends Includes<Y, (Pick<(T & C), K> & { sum: number })>>(params: GroupQueryObject<T, W & ToWhere<{ sum: number }>, K | 'sum', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { sum: number }, U>>>;
  sum<A extends string, U extends Includes<Y, (Pick<(T & C), K> & { sum: number })>>(params: GroupQueryObjectAlias<T, W & ToWhere<{ sum: number }>, K | 'sum', U, A>): Promise<Array<MergeIncludes<Pick<(T & C), K> & Record<A, number>, U>>>;
  array<S extends keyof (T & C), U extends Includes<Y, Pick<(T & C), K>>>(params: GroupArrayValue<T, W & ToWhere<{ sum: number }>, K | 'items', U, S>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { items: Array<(T & C)[S]> }, U>>>;
  array<A extends string, S extends keyof (T & C), U extends Includes<Y, Pick<(T & C), K>>>(params: GroupArrayValueAlias<T, W & ToWhere<{ sum: number }>, K | 'items', U, A, S>): Promise<Array<MergeIncludes<Pick<(T & C), K> & Record<A, Array<(T & C)[S]>>, U>>>;
  array<U extends Includes<Y, Pick<(T & C), K>>>(params: GroupArray<T, W & ToWhere<{ sum: number }>, K | 'items', U>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { items: Array<T> }, U>>>;
  array<A extends string, U extends Includes<Y, Pick<(T & C), K>>>(params: GroupArrayAlias<T, W & ToWhere<{ sum: number }>, K | 'items', U, A>): Promise<Array<MergeIncludes<Pick<(T & C), K> & Record<A, Array<T>>, U>>>;
  array<S extends keyof (T & C), U extends Includes<Y, Pick<(T & C), K>>>(params: GroupArraySelect<T, W & ToWhere<{ sum: number }>, K | 'items', U, S>): Promise<Array<MergeIncludes<Pick<(T & C), K> & { items: Array<Pick<(T & C), S>> }, U>>>;
  array<A extends string, S extends keyof (T & C), U extends Includes<Y, Pick<(T & C), K>>>(params: GroupArraySelectAlias<T, W & ToWhere<{ sum: number }>, K | 'items', U, A, S>): Promise<Array<MergeIncludes<Pick<(T & C), K> & Record<A, Array<Pick<(T & C), S>>>, U>>>;
}

interface ComputeMethods {
  abs: (n: number) => void;
  coalesce: (a: any, b: any, ...rest: any[]) => void;
  concat: (...args: any[]) => void;
  concatWs: (...args: any[]) => void;
  format: (format: string | null, ...args: any[]) => void;
  glob: (pattern: string, value: string) => void;
  hex: (value: number | Buffer) => void;
  if: (...args: any[]) => void;
  instr: (a: string | Buffer | null, b: string | Buffer | null) => void;
  length: (value: any) => void;
  lower: (value: string) => void;
  ltrim: (value: string, remove?: string) => void;
  max: (a: any, b: any, ...rest: any[]) => void;
  min: (a: any, b: any, ...rest: any[]) => void;
  nullif: (a: any, b: any) => void;
  octetLength: (value: any) => void;
  replace: (value: any, occurances: any, substitute: any) => void;
  round: (value: number, places?: number) => void;
  rtrim: (value: string, remove?: string) => void;
  sign: (value: any) => void;
  substring: (value: string, start: number, length?: number) => void;
  trim: (value: string, remove?: string) => void;
  unhex: (hex: string, ignore?: string) => void;
  unicode: (value: string) => void;
  upper: (value: string) => void;
  date: (time?: string | number, ...modifers: string[]) => void;
  time: (time?: string | number, ...modifers: string[]) => void;
  dateTime: (time?: string | number, ...modifers: string[]) => void;
  julianDay: (time?: string | number, ...modifers: string[]) => void;
  unixEpoch: (time?: string | number, ...modifers: string[]) => void;
  strfTime: (format: string, time: string | number, ...modifers: string[]) => void;
  timeDiff: (start: string | number, end: string | number) => void;
  acos: (value: number) => void;
  acosh: (value: number) => void;
  asin: (value: number) => void;
  asinh: (value: number) => void;
  atan: (value: number) => void;
  atan2: (b: number, a: number) => void;
  atanh: (value: number) => void;
  ceil: (value: number) => void;
  cos: (value: number) => void;
  cosh: (value: number) => void;
  degrees: (value: number) => void;
  exp: (value: number) => void;
  floor: (value: number) => void;
  ln: (value: number) => void;
  log: (base: number, value: number) => void;
  mod: (value: number, divider: number) => void;
  pi: () => void;
  power: (value: number, exponent: number) => void;
  radians: (value: number) => void;
  sin: (value: number) => void;
  sinh: (value: number) => void;
  sqrt: (value: number) => void;
  tan: (value: number) => void;
  tanh: (value: number) => void;
  trunc: (value: number) => void;
  json: (text: string | Buffer) => void;
  jsonExtract: (json: string | Buffer, path: string) => void;
}

interface Compute<T> {
  [key: string]: (column: T, method: ComputeMethods) => void;
}

interface VirtualQueries<T, W> {
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
  query(query: HighlightQuery<W, T>): Promise<Array<{ id: number, highlight: string }>>;
  query(query: SnippetQuery<W, T>): Promise<Array<{ id: number, snippet: string }>>;
}

interface Queries<T, I, W, C, R, Y> {
  [key: string]: any;
  insert(params: I): Promise<R>;
  insertMany(params: Array<I>): Promise<void>;
  update(options: UpdateQuery<W, I>): Promise<number>;
  upsert<K extends keyof T>(options: UpsertQuery<I, K>): Promise<R>;
  get(params?: W | null): Promise<T | undefined>;
  get<K extends keyof (T & C)>(params: W | null, column: K): Promise<(T & C)[K] | undefined>;
  get<K extends keyof (T & C)>(params: W | null, columns: (keyof (T & C))[] | K[]): Promise<Pick<(T & C), K> | undefined>;
  get<N>(params: W | null, column: (selector: T) => N): Promise<N | undefined>;
  many(params?: W): Promise<Array<T>>;
  many<K extends keyof (T & C)>(params: W | null, columns: (keyof (T & C))[] | K[]): Promise<Array<Pick<(T & C), K>>>;
  many<K extends keyof (T & C)>(params: W | null, column: K): Promise<Array<(T & C)[K]>>;
  query<K extends keyof (T & C)>(query: ComplexQueryValue<W, K, T, C>): Promise<Array<(T & C)[K]>>;
  query<K extends keyof (T & C)>(query: ComplexQueryValueDebug<W, K, T, C>): Promise<DebugResult<Array<(T & C)[K]>>>;
  query<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectInclude<W, K, T, U, C>): Promise<Array<MergeIncludes<Pick<(T & C), K>, U>>>;
  query<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeDebug<W, K, T, U, C>): Promise<DebugResult<Array<MergeIncludes<Pick<(T & C), K>, U>>>>;
  query<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmit<W, K, T, U, C>): Promise<Array<MergeIncludes<Omit<T, K>, U>>>;
  query<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmitDebug<W, K, T, U, C>): Promise<DebugResult<Array<MergeIncludes<Omit<T, K>, U>>>>;
  query<U extends Includes<Y, T>>(query: ComplexQueryInclude<W, T, U, C>): Promise<Array<MergeIncludes<T, U>>>;
  query<U extends Includes<Y, T>>(query: ComplexQueryIncludeDebug<W, T, U, C>): Promise<DebugResult<Array<MergeIncludes<T, U>>>>;
  first<K extends keyof (T & C)>(query: ComplexQueryValue<W, K, T, C>): Promise<(T & C)[K] | undefined>;
  first<K extends keyof (T & C)>(query: ComplexQueryValueDebug<W, K, T, C>): Promise<DebugResult<(T & C)[K] | undefined>>;
  first<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectInclude<W, K, T, U, C>): Promise<MergeIncludes<Pick<(T & C), K>, U> | undefined>;
  first<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeDebug<W, K, T, U, C>): Promise<DebugResult<MergeIncludes<Pick<(T & C), K>, U> | undefined>>;
  first<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmit<W, K, T, U, C>): Promise<MergeIncludes<Omit<T, K>, U> | undefined>;
  first<K extends keyof (T & C), U extends Includes<Y, T>>(query: ComplexQueryObjectIncludeOmitDebug<W, K, T, U, C>): Promise<DebugResult<MergeIncludes<Omit<T, K>, U> | undefined>>;
  first<U extends Includes<Y, T>>(query: ComplexQueryInclude<W, T, U, C>): Promise<MergeIncludes<(T & C), U> | undefined>;
  first<U extends Includes<Y, T>>(query: ComplexQueryIncludeDebug<W, T, U, C>): Promise<DebugResult<MergeIncludes<(T & C), U> | undefined>>;
  count<K extends keyof (T & C)>(query?: AggregateQuery<W, K>): Promise<number>;
  count<K extends keyof (T & C)>(query?: AggregateQueryDebug<W, K>): Promise<DebugResult<number>>;
  avg<K extends keyof (T & C)>(query: AggregateQuery<W, K>): Promise<number>;
  avg<K extends keyof (T & C)>(query: AggregateQueryDebug<W, K>): Promise<DebugResult<number>>;
  max<K extends keyof (T & C)>(query: AggregateQuery<W, K>): Promise<number>;
  max<K extends keyof (T & C)>(query: AggregateQueryDebug<W, K>): Promise<DebugResult<number>>;
  min<K extends keyof (T & C)>(query: AggregateQuery<W, K>): Promise<number>;
  min<K extends keyof (T & C)>(query: AggregateQueryDebug<W, K>): Promise<DebugResult<number>>;
  sum<K extends keyof (T & C)>(query: AggregateQuery<W, K>): Promise<number>;
  sum<K extends keyof (T & C)>(query: AggregateQueryDebug<W, K>): Promise<DebugResult<number>>;
  exists(params: W | null): Promise<boolean>;
  groupBy<K extends keyof (T & C)>(columns: K | Array<K>): AggregateMethods<T, W, C, K, Y>;
  compute(properties: Compute<T>): void;
  remove(params?: W): Promise<number>;
}

type CompareMethods<T> = {
  not: (value: T) => void;
	gt: (value: NonNullable<T>) => void;
	lt: (value: NonNullable<T>) => void;
	lte: (value: NonNullable<T>) => void;
	like: (pattern: NonNullable<T>) => void;
	match: (pattern: NonNullable<T>) => void;
	glob: (pattern: NonNullable<T>) => void;
	eq: (value: T) => void;
}

type Transform<T> = NonNullable<T> extends string | number | Date
  ? CompareMethods<T>
  : NonNullable<T> extends boolean
  ? Pick<CompareMethods<T>, 'not' | 'eq'>
  : T;

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

interface SqlQueryParamsUnsafe<P, U> {
  params: P;
  unsafe: U;
}

interface SqlQueryParams<P> {
  params: P;
  unsafe?: undefined;
}

interface SqlQueryUnsafe<U> {
  params?: undefined;
  unsafe: U;
}

type WhereField<T> = T | Array<NonNullable<T>> | WhereFunction<T>;

type OptionalToNull<T> = {
  [K in keyof T]-?: undefined extends T[K] ? Exclude<T[K], undefined> | null : T[K];
};

type ReplaceJson<T> =
  null extends T
    ? ReplaceJson<Exclude<T, null>> | null
    : JsonObject extends T
      ? string
      : [] extends T
        ? string
        : T;

type ToWhere<T> = {
  [K in keyof T]?: WhereField<ReplaceJson<T[K]>>;
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
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryObjectIncludeParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U>): Promise<Array<MergeIncludes<Pick<LocationById, K>, U>>>;
  byId<K extends keyof LocationById, U extends Includes<TypedDb, LocationById>>(query: ComplexSqlQueryObjectIncludeOmitParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById, U>): Promise<Array<MergeIncludes<Omit<LocationById, K>, U>>>;
  byId<K extends keyof LocationById>(query: ComplexSqlQueryValueParams<LocationByIdParams, ToWhere<LocationById>, K, LocationById>): Promise<Array<LocationById[K]>>;
  byMethod<U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryIncludeParams<LocationByMethodParams, ToWhere<LocationByMethod>, LocationByMethod, U>): Promise<Array<MergeIncludes<LocationByMethod, U>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryObjectIncludeParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U>): Promise<Array<MergeIncludes<Pick<LocationByMethod, K>, U>>>;
  byMethod<K extends keyof LocationByMethod, U extends Includes<TypedDb, LocationByMethod>>(query: ComplexSqlQueryObjectIncludeOmitParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod, U>): Promise<Array<MergeIncludes<Omit<LocationByMethod, K>, U>>>;
  byMethod<K extends keyof LocationByMethod>(query: ComplexSqlQueryValueParams<LocationByMethodParams, ToWhere<LocationByMethod>, K, LocationByMethod>): Promise<Array<LocationByMethod[K]>>;
  detailedEvents<U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryInclude<ToWhere<LocationDetailedEvents>, LocationDetailedEvents, U>): Promise<Array<MergeIncludes<LocationDetailedEvents, U>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryObjectInclude<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U>): Promise<Array<MergeIncludes<Pick<LocationDetailedEvents, K>, U>>>;
  detailedEvents<K extends keyof LocationDetailedEvents, U extends Includes<TypedDb, LocationDetailedEvents>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents, U>): Promise<Array<MergeIncludes<Omit<LocationDetailedEvents, K>, U>>>;
  detailedEvents<K extends keyof LocationDetailedEvents>(query: ComplexSqlQueryValue<ToWhere<LocationDetailedEvents>, K, LocationDetailedEvents>): Promise<Array<LocationDetailedEvents[K]>>;
  distanceFrom<U extends Includes<TypedDb, LocationDistanceFrom>>(query: ComplexSqlQueryIncludeParams<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, LocationDistanceFrom, U>): Promise<Array<MergeIncludes<LocationDistanceFrom, U>>>;
  distanceFrom<K extends keyof LocationDistanceFrom, U extends Includes<TypedDb, LocationDistanceFrom>>(query: ComplexSqlQueryObjectIncludeParams<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, K, LocationDistanceFrom, U>): Promise<Array<MergeIncludes<Pick<LocationDistanceFrom, K>, U>>>;
  distanceFrom<K extends keyof LocationDistanceFrom, U extends Includes<TypedDb, LocationDistanceFrom>>(query: ComplexSqlQueryObjectIncludeOmitParams<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, K, LocationDistanceFrom, U>): Promise<Array<MergeIncludes<Omit<LocationDistanceFrom, K>, U>>>;
  distanceFrom<K extends keyof LocationDistanceFrom>(query: ComplexSqlQueryValueParams<LocationDistanceFromParams, ToWhere<LocationDistanceFrom>, K, LocationDistanceFrom>): Promise<Array<LocationDistanceFrom[K]>>;
  events<U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryInclude<ToWhere<LocationEvents>, LocationEvents, U>): Promise<Array<MergeIncludes<LocationEvents, U>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryObjectInclude<ToWhere<LocationEvents>, K, LocationEvents, U>): Promise<Array<MergeIncludes<Pick<LocationEvents, K>, U>>>;
  events<K extends keyof LocationEvents, U extends Includes<TypedDb, LocationEvents>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<LocationEvents>, K, LocationEvents, U>): Promise<Array<MergeIncludes<Omit<LocationEvents, K>, U>>>;
  events<K extends keyof LocationEvents>(query: ComplexSqlQueryValue<ToWhere<LocationEvents>, K, LocationEvents>): Promise<Array<LocationEvents[K]>>;
  winners<U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryInclude<ToWhere<LocationWinners>, LocationWinners, U>): Promise<Array<MergeIncludes<LocationWinners, U>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryObjectInclude<ToWhere<LocationWinners>, K, LocationWinners, U>): Promise<Array<MergeIncludes<Pick<LocationWinners, K>, U>>>;
  winners<K extends keyof LocationWinners, U extends Includes<TypedDb, LocationWinners>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<LocationWinners>, K, LocationWinners, U>): Promise<Array<MergeIncludes<Omit<LocationWinners, K>, U>>>;
  winners<K extends keyof LocationWinners>(query: ComplexSqlQueryValue<ToWhere<LocationWinners>, K, LocationWinners>): Promise<Array<LocationWinners[K]>>;
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
  awayFrom<K extends keyof EventAwayFrom, U extends Includes<TypedDb, EventAwayFrom>>(query: ComplexSqlQueryObjectIncludeParams<EventAwayFromParams, ToWhere<EventAwayFrom>, K, EventAwayFrom, U>): Promise<Array<MergeIncludes<Pick<EventAwayFrom, K>, U>>>;
  awayFrom<K extends keyof EventAwayFrom, U extends Includes<TypedDb, EventAwayFrom>>(query: ComplexSqlQueryObjectIncludeOmitParams<EventAwayFromParams, ToWhere<EventAwayFrom>, K, EventAwayFrom, U>): Promise<Array<MergeIncludes<Omit<EventAwayFrom, K>, U>>>;
  awayFrom<K extends keyof EventAwayFrom>(query: ComplexSqlQueryValueParams<EventAwayFromParams, ToWhere<EventAwayFrom>, K, EventAwayFrom>): Promise<Array<EventAwayFrom[K]>>;
  from<U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryInclude<ToWhere<EventFrom>, EventFrom, U>): Promise<Array<MergeIncludes<EventFrom, U>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventFrom>, K, EventFrom, U>): Promise<Array<MergeIncludes<Pick<EventFrom, K>, U>>>;
  from<K extends keyof EventFrom, U extends Includes<TypedDb, EventFrom>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventFrom>, K, EventFrom, U>): Promise<Array<MergeIncludes<Omit<EventFrom, K>, U>>>;
  from<K extends keyof EventFrom>(query: ComplexSqlQueryValue<ToWhere<EventFrom>, K, EventFrom>): Promise<Array<EventFrom[K]>>;
  lag<U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryInclude<ToWhere<EventLag>, EventLag, U>): Promise<Array<MergeIncludes<EventLag, U>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventLag>, K, EventLag, U>): Promise<Array<MergeIncludes<Pick<EventLag, K>, U>>>;
  lag<K extends keyof EventLag, U extends Includes<TypedDb, EventLag>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventLag>, K, EventLag, U>): Promise<Array<MergeIncludes<Omit<EventLag, K>, U>>>;
  lag<K extends keyof EventLag>(query: ComplexSqlQueryValue<ToWhere<EventLag>, K, EventLag>): Promise<Array<EventLag[K]>>;
  operator<U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryInclude<ToWhere<EventOperator>, EventOperator, U>): Promise<Array<MergeIncludes<EventOperator, U>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventOperator>, K, EventOperator, U>): Promise<Array<MergeIncludes<Pick<EventOperator, K>, U>>>;
  operator<K extends keyof EventOperator, U extends Includes<TypedDb, EventOperator>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventOperator>, K, EventOperator, U>): Promise<Array<MergeIncludes<Omit<EventOperator, K>, U>>>;
  operator<K extends keyof EventOperator>(query: ComplexSqlQueryValue<ToWhere<EventOperator>, K, EventOperator>): Promise<Array<EventOperator[K]>>;
  spaces<U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryInclude<ToWhere<EventSpaces>, EventSpaces, U>): Promise<Array<MergeIncludes<EventSpaces, U>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventSpaces>, K, EventSpaces, U>): Promise<Array<MergeIncludes<Pick<EventSpaces, K>, U>>>;
  spaces<K extends keyof EventSpaces, U extends Includes<TypedDb, EventSpaces>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventSpaces>, K, EventSpaces, U>): Promise<Array<MergeIncludes<Omit<EventSpaces, K>, U>>>;
  spaces<K extends keyof EventSpaces>(query: ComplexSqlQueryValue<ToWhere<EventSpaces>, K, EventSpaces>): Promise<Array<EventSpaces[K]>>;
  test<U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryInclude<ToWhere<EventTest>, EventTest, U>): Promise<Array<MergeIncludes<EventTest, U>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryObjectInclude<ToWhere<EventTest>, K, EventTest, U>): Promise<Array<MergeIncludes<Pick<EventTest, K>, U>>>;
  test<K extends keyof EventTest, U extends Includes<TypedDb, EventTest>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<EventTest>, K, EventTest, U>): Promise<Array<MergeIncludes<Omit<EventTest, K>, U>>>;
  test<K extends keyof EventTest>(query: ComplexSqlQueryValue<ToWhere<EventTest>, K, EventTest>): Promise<Array<EventTest[K]>>;
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

export interface CoachFrom {
  id: number;
}

export interface CoachQueries {
  from<U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryInclude<ToWhere<CoachFrom>, CoachFrom, U>): Promise<Array<MergeIncludes<CoachFrom, U>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryObjectInclude<ToWhere<CoachFrom>, K, CoachFrom, U>): Promise<Array<MergeIncludes<Pick<CoachFrom, K>, U>>>;
  from<K extends keyof CoachFrom, U extends Includes<TypedDb, CoachFrom>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<CoachFrom>, K, CoachFrom, U>): Promise<Array<MergeIncludes<Omit<CoachFrom, K>, U>>>;
  from<K extends keyof CoachFrom>(query: ComplexSqlQueryValue<ToWhere<CoachFrom>, K, CoachFrom>): Promise<Array<CoachFrom[K]>>;
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

export interface ComputedFighter {
  displayName: string;
  instagram: string | null;
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
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterByHeight>, K, FighterByHeight, U>): Promise<Array<MergeIncludes<Pick<FighterByHeight, K>, U>>>;
  byHeight<K extends keyof FighterByHeight, U extends Includes<TypedDb, FighterByHeight>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterByHeight>, K, FighterByHeight, U>): Promise<Array<MergeIncludes<Omit<FighterByHeight, K>, U>>>;
  byHeight<K extends keyof FighterByHeight>(query: ComplexSqlQueryValue<ToWhere<FighterByHeight>, K, FighterByHeight>): Promise<Array<FighterByHeight[K]>>;
  common<U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryIncludeParams<FighterCommonParams, ToWhere<FighterCommon>, FighterCommon, U>): Promise<Array<MergeIncludes<FighterCommon, U>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryObjectIncludeParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U>): Promise<Array<MergeIncludes<Pick<FighterCommon, K>, U>>>;
  common<K extends keyof FighterCommon, U extends Includes<TypedDb, FighterCommon>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon, U>): Promise<Array<MergeIncludes<Omit<FighterCommon, K>, U>>>;
  common<K extends keyof FighterCommon>(query: ComplexSqlQueryValueParams<FighterCommonParams, ToWhere<FighterCommon>, K, FighterCommon>): Promise<Array<FighterCommon[K]>>;
  extract<U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryIncludeParams<FighterExtractParams, ToWhere<FighterExtract>, FighterExtract, U>): Promise<Array<MergeIncludes<FighterExtract, U>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryObjectIncludeParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U>): Promise<Array<MergeIncludes<Pick<FighterExtract, K>, U>>>;
  extract<K extends keyof FighterExtract, U extends Includes<TypedDb, FighterExtract>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract, U>): Promise<Array<MergeIncludes<Omit<FighterExtract, K>, U>>>;
  extract<K extends keyof FighterExtract>(query: ComplexSqlQueryValueParams<FighterExtractParams, ToWhere<FighterExtract>, K, FighterExtract>): Promise<Array<FighterExtract[K]>>;
  filter<U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryInclude<ToWhere<FighterFilter>, FighterFilter, U>): Promise<Array<MergeIncludes<FighterFilter, U>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterFilter>, K, FighterFilter, U>): Promise<Array<MergeIncludes<Pick<FighterFilter, K>, U>>>;
  filter<K extends keyof FighterFilter, U extends Includes<TypedDb, FighterFilter>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterFilter>, K, FighterFilter, U>): Promise<Array<MergeIncludes<Omit<FighterFilter, K>, U>>>;
  filter<K extends keyof FighterFilter>(query: ComplexSqlQueryValue<ToWhere<FighterFilter>, K, FighterFilter>): Promise<Array<FighterFilter[K]>>;
  instagram<U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryInclude<ToWhere<FighterInstagram>, FighterInstagram, U>): Promise<Array<MergeIncludes<FighterInstagram, U>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterInstagram>, K, FighterInstagram, U>): Promise<Array<MergeIncludes<Pick<FighterInstagram, K>, U>>>;
  instagram<K extends keyof FighterInstagram, U extends Includes<TypedDb, FighterInstagram>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterInstagram>, K, FighterInstagram, U>): Promise<Array<MergeIncludes<Omit<FighterInstagram, K>, U>>>;
  instagram<K extends keyof FighterInstagram>(query: ComplexSqlQueryValue<ToWhere<FighterInstagram>, K, FighterInstagram>): Promise<Array<FighterInstagram[K]>>;
  lastFights<U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryIncludeParams<FighterLastFightsParams, ToWhere<FighterLastFights>, FighterLastFights, U>): Promise<Array<MergeIncludes<FighterLastFights, U>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryObjectIncludeParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U>): Promise<Array<MergeIncludes<Pick<FighterLastFights, K>, U>>>;
  lastFights<K extends keyof FighterLastFights, U extends Includes<TypedDb, FighterLastFights>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights, U>): Promise<Array<MergeIncludes<Omit<FighterLastFights, K>, U>>>;
  lastFights<K extends keyof FighterLastFights>(query: ComplexSqlQueryValueParams<FighterLastFightsParams, ToWhere<FighterLastFights>, K, FighterLastFights>): Promise<Array<FighterLastFights[K]>>;
  left<U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryInclude<ToWhere<FighterLeft>, FighterLeft, U>): Promise<Array<MergeIncludes<FighterLeft, U>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterLeft>, K, FighterLeft, U>): Promise<Array<MergeIncludes<Pick<FighterLeft, K>, U>>>;
  left<K extends keyof FighterLeft, U extends Includes<TypedDb, FighterLeft>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterLeft>, K, FighterLeft, U>): Promise<Array<MergeIncludes<Omit<FighterLeft, K>, U>>>;
  left<K extends keyof FighterLeft>(query: ComplexSqlQueryValue<ToWhere<FighterLeft>, K, FighterLeft>): Promise<Array<FighterLeft[K]>>;
  methods<U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryIncludeParams<FighterMethodsParams, ToWhere<FighterMethods>, FighterMethods, U>): Promise<Array<MergeIncludes<FighterMethods, U>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryObjectIncludeParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U>): Promise<Array<MergeIncludes<Pick<FighterMethods, K>, U>>>;
  methods<K extends keyof FighterMethods, U extends Includes<TypedDb, FighterMethods>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods, U>): Promise<Array<MergeIncludes<Omit<FighterMethods, K>, U>>>;
  methods<K extends keyof FighterMethods>(query: ComplexSqlQueryValueParams<FighterMethodsParams, ToWhere<FighterMethods>, K, FighterMethods>): Promise<Array<FighterMethods[K]>>;
  opponents<U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryInclude<ToWhere<FighterOpponents>, FighterOpponents, U>): Promise<Array<MergeIncludes<FighterOpponents, U>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterOpponents>, K, FighterOpponents, U>): Promise<Array<MergeIncludes<Pick<FighterOpponents, K>, U>>>;
  opponents<K extends keyof FighterOpponents, U extends Includes<TypedDb, FighterOpponents>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterOpponents>, K, FighterOpponents, U>): Promise<Array<MergeIncludes<Omit<FighterOpponents, K>, U>>>;
  opponents<K extends keyof FighterOpponents>(query: ComplexSqlQueryValue<ToWhere<FighterOpponents>, K, FighterOpponents>): Promise<Array<FighterOpponents[K]>>;
  otherNames<U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryInclude<ToWhere<FighterOtherNames>, FighterOtherNames, U>): Promise<Array<MergeIncludes<FighterOtherNames, U>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterOtherNames>, K, FighterOtherNames, U>): Promise<Array<MergeIncludes<Pick<FighterOtherNames, K>, U>>>;
  otherNames<K extends keyof FighterOtherNames, U extends Includes<TypedDb, FighterOtherNames>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterOtherNames>, K, FighterOtherNames, U>): Promise<Array<MergeIncludes<Omit<FighterOtherNames, K>, U>>>;
  otherNames<K extends keyof FighterOtherNames>(query: ComplexSqlQueryValue<ToWhere<FighterOtherNames>, K, FighterOtherNames>): Promise<Array<FighterOtherNames[K]>>;
  right<U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryInclude<ToWhere<FighterRight>, FighterRight, U>): Promise<Array<MergeIncludes<FighterRight, U>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterRight>, K, FighterRight, U>): Promise<Array<MergeIncludes<Pick<FighterRight, K>, U>>>;
  right<K extends keyof FighterRight, U extends Includes<TypedDb, FighterRight>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterRight>, K, FighterRight, U>): Promise<Array<MergeIncludes<Omit<FighterRight, K>, U>>>;
  right<K extends keyof FighterRight>(query: ComplexSqlQueryValue<ToWhere<FighterRight>, K, FighterRight>): Promise<Array<FighterRight[K]>>;
  weightClasses<U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryIncludeParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, FighterWeightClasses, U>): Promise<Array<MergeIncludes<FighterWeightClasses, U>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U>): Promise<Array<MergeIncludes<Pick<FighterWeightClasses, K>, U>>>;
  weightClasses<K extends keyof FighterWeightClasses, U extends Includes<TypedDb, FighterWeightClasses>>(query: ComplexSqlQueryObjectIncludeOmitParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses, U>): Promise<Array<MergeIncludes<Omit<FighterWeightClasses, K>, U>>>;
  weightClasses<K extends keyof FighterWeightClasses>(query: ComplexSqlQueryValueParams<FighterWeightClassesParams, ToWhere<FighterWeightClasses>, K, FighterWeightClasses>): Promise<Array<FighterWeightClasses[K]>>;
  withReach<U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryInclude<ToWhere<FighterWithReach>, FighterWithReach, U>): Promise<Array<MergeIncludes<FighterWithReach, U>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryObjectInclude<ToWhere<FighterWithReach>, K, FighterWithReach, U>): Promise<Array<MergeIncludes<Pick<FighterWithReach, K>, U>>>;
  withReach<K extends keyof FighterWithReach, U extends Includes<TypedDb, FighterWithReach>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<FighterWithReach>, K, FighterWithReach, U>): Promise<Array<MergeIncludes<Omit<FighterWithReach, K>, U>>>;
  withReach<K extends keyof FighterWithReach>(query: ComplexSqlQueryValue<ToWhere<FighterWithReach>, K, FighterWithReach>): Promise<Array<FighterWithReach[K]>>;
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
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryObjectIncludeParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U>): Promise<Array<MergeIncludes<Pick<MethodByFighter, K>, U>>>;
  byFighter<K extends keyof MethodByFighter, U extends Includes<TypedDb, MethodByFighter>>(query: ComplexSqlQueryObjectIncludeOmitParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter, U>): Promise<Array<MergeIncludes<Omit<MethodByFighter, K>, U>>>;
  byFighter<K extends keyof MethodByFighter>(query: ComplexSqlQueryValueParams<MethodByFighterParams, ToWhere<MethodByFighter>, K, MethodByFighter>): Promise<Array<MethodByFighter[K]>>;
  coach<U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryInclude<ToWhere<MethodCoach>, MethodCoach, U>): Promise<Array<MergeIncludes<MethodCoach, U>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryObjectInclude<ToWhere<MethodCoach>, K, MethodCoach, U>): Promise<Array<MergeIncludes<Pick<MethodCoach, K>, U>>>;
  coach<K extends keyof MethodCoach, U extends Includes<TypedDb, MethodCoach>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<MethodCoach>, K, MethodCoach, U>): Promise<Array<MergeIncludes<Omit<MethodCoach, K>, U>>>;
  coach<K extends keyof MethodCoach>(query: ComplexSqlQueryValue<ToWhere<MethodCoach>, K, MethodCoach>): Promise<Array<MethodCoach[K]>>;
  topSubmission<U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryInclude<ToWhere<MethodTopSubmission>, MethodTopSubmission, U>): Promise<Array<MergeIncludes<MethodTopSubmission, U>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryObjectInclude<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U>): Promise<Array<MergeIncludes<Pick<MethodTopSubmission, K>, U>>>;
  topSubmission<K extends keyof MethodTopSubmission, U extends Includes<TypedDb, MethodTopSubmission>>(query: ComplexSqlQueryObjectIncludeOmit<ToWhere<MethodTopSubmission>, K, MethodTopSubmission, U>): Promise<Array<MergeIncludes<Omit<MethodTopSubmission, K>, U>>>;
  topSubmission<K extends keyof MethodTopSubmission>(query: ComplexSqlQueryValue<ToWhere<MethodTopSubmission>, K, MethodTopSubmission>): Promise<Array<MethodTopSubmission[K]>>;
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
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryObjectIncludeParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U>): Promise<Array<MergeIncludes<Pick<FightByFighter, K>, U>>>;
  byFighter<K extends keyof FightByFighter, U extends Includes<TypedDb, FightByFighter>>(query: ComplexSqlQueryObjectIncludeOmitParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter, U>): Promise<Array<MergeIncludes<Omit<FightByFighter, K>, U>>>;
  byFighter<K extends keyof FightByFighter>(query: ComplexSqlQueryValueParams<FightByFighterParams, ToWhere<FightByFighter>, K, FightByFighter>): Promise<Array<FightByFighter[K]>>;
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

type Unwrap<T extends any[]> = {
  [K in keyof T]: T[K] extends Promise<infer U> ? U : T[K];
};

interface TypedDb {
  [key: string]: any;
  weightClasses: Queries<WeightClass, InsertWeightClass, ToWhere<WeightClass & unknown>, unknown, number, TypedDb>;
  locations: Queries<Location, InsertLocation, ToWhere<Location & unknown>, unknown, number, TypedDb> & LocationQueries;
  events: Queries<Event, InsertEvent, ToWhere<Event & unknown>, unknown, number, TypedDb> & EventQueries;
  cards: Queries<Card, InsertCard, ToWhere<Card & unknown>, unknown, number, TypedDb>;
  coaches: Queries<Coach, InsertCoach, ToWhere<Coach & unknown>, unknown, number, TypedDb> & CoachQueries;
  fighters: Queries<Fighter, InsertFighter, ToWhere<Fighter & ComputedFighter>, ComputedFighter, number, TypedDb> & FighterQueries;
  otherNames: Queries<OtherName, InsertOtherName, ToWhere<OtherName & unknown>, unknown, number, TypedDb>;
  fighterCoaches: Queries<FighterCoach, InsertFighterCoach, ToWhere<FighterCoach & unknown>, unknown, number, TypedDb>;
  rankings: Queries<Ranking, InsertRanking, ToWhere<Ranking & unknown>, unknown, number, TypedDb>;
  methods: Queries<Method, InsertMethod, ToWhere<Method & unknown>, unknown, number, TypedDb> & MethodQueries;
  fights: Queries<Fight, InsertFight, ToWhere<Fight & unknown>, unknown, number, TypedDb> & FightQueries;
  cancelledFights: Queries<CancelledFight, InsertCancelledFight, ToWhere<CancelledFight & unknown>, unknown, number, TypedDb>;
  titleRemovals: Queries<TitleRemoval, InsertTitleRemoval, ToWhere<TitleRemoval & unknown>, unknown, number, TypedDb>;
  fighterProfiles: VirtualQueries<FighterProfile, ToWhere<FighterProfile & unknown>>;
  opponents: Omit<Queries<Opponent, InsertOpponent, ToWhere<Opponent & unknown>, unknown, undefined, TypedDb>, 'remove' | 'insert' | 'insertMany' | 'update' | 'upsert'>;
  exec(sql: string): Promise<void>;
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  pragma(sql: string): Promise<any[]>;
  deferForeignKeys(): Promise<void>;
  getTransaction(): Promise<TypedDb>;
  batch:<T extends any[]> (batcher: (bx: TypedDb) => T) => Promise<Unwrap<T>>;
}

export const database: SQLiteDatabase;
export const db: TypedDb;
