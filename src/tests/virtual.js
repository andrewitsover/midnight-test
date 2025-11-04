import { SQLiteDatabase, Unicode61, FTSTable } from 'flyweightjs';
import { join } from 'path';
import { test } from '../run.js';

const tokenizer = new Unicode61({
  removeDiacritics: true,
  porter: true
});

class Emails extends FTSTable {
  from = this.Text;
  to = this.Text;
  body = this.Text;

  Tokenizer = tokenizer;
}

const path = join(import.meta.dirname, `../../databases/virtual.db`);
const database = new SQLiteDatabase(path);
await database.initialize();
const db = database.getClient({ Emails });
if (database.created) {
  const sql = db.diff();
  await db.migrate(sql);
  console.log(sql);
}

test('Insert into fts5 table', async () => {
  await db.emails.insert({
    from: 'andrew@gmail.com',
    to: 'elon@gmail.com',
    body: 'When is my CyberTruck arriving?'
  });
  const email = await db.emails.get({ emails: 'gmail' });
  console.log(email);
});
