import { SQLiteDatabase, Table } from '@andrewitsover/midnight';

const createData = async () => {
  class Users extends Table {
    id = this.IntPrimary;
    name;
    isActive = true;
    createdAt = this.Now;
  }

  class Drawings extends Table {
    userId = this.Cascade(Users);
    data;
  }

  const database = new SQLiteDatabase(':memory:');
  const db = database.getClient({ Users, Drawings });
  const sql = db.diff();
  await db.migrate(sql);
  await db.users.insert({ name: 'Andrew' });
  await db.users.insert({ name: 'James' });
  await db.users.insert({ name: 'Bradley', isActive: false });

  return db;
}

export default createData;
