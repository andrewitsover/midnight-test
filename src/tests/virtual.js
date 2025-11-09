import { SQLiteDatabase, Unicode61, FTSTable, Table } from 'flyweightjs';
import { join } from 'path';
import { test } from '../run.js';
import { strict as assert } from 'assert';

const tokenizer = new Unicode61({
  removeDiacritics: true,
  porter: true
});

class Emails extends FTSTable {
  from;
  to;
  body;

  Tokenizer = tokenizer;
}

class Tests extends Table {
  name;
  emailId = this.Cascade(Emails)
}

const path = join(import.meta.dirname, `../../databases/virtual.db`);
const database = new SQLiteDatabase(path);
await database.initialize();
const db = database.getClient({ Emails, Tests });
if (database.created) {
  const sql = db.diff();
  await db.migrate(sql);
  console.log(sql);
}

test('Insert into fts5 table', async () => {
  const count = await db.emails.count();
  if (count === 0) {
    await db.emails.insert({
      from: 'andrew@gmail.com',
      to: 'elon@gmail.com',
      body: 'When is my CyberTruck arriving?'
    });
    await db.emails.insert({
      from: 'elon@gmail.com',
      to: 'andrew@gmail.com',
      body: 'Very soon. We are adding the afterburners.'
    });
    await db.emails.insert({
      from: 'dhh@hey.com',
      to: 'andrew@gmail.com',
      body: 'When are you going to install Omarchy?'
    });
    await db.emails.insert({
      from: 'andrew@gmail.com',
      to: 'dhh@hey.com',
      body: 'When I finish my current project.'
    });
  }
});

test('and startsWith', async () => {
  const emails = await db.emails.match({
    return: 'rowid',
    column: {
      body: {
        and: [{ startsWith: 'When' }, 'project']
      }
    }
  });
  console.log(emails);
});
