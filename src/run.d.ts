import { TypedDb, Database, SQLiteDatabase, TursoDatabase } from "./drivers/sqlite";

interface Context {
  db: TypedDb;
  paths: any;
  dbType: string;
  rewrite: boolean;
}

interface CommonContext extends Context {
  database: Database;
}

export interface SQLiteContext extends Context {
  database: SQLiteDatabase;
}

export interface TursoContext extends Context {
  database: TursoDatabase;
}

export interface Context {
  common: CommonContext;
  sqlite?: SQLiteContext;
  turso?: TursoContext;
}

export function test(name: string, test: (context: Context) => Promise<void>): void;
export function cleanUp(name: string, cleanUp: (context: Context) => Promise<void>): void;
