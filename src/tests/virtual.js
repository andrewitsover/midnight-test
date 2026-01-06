import { SQLiteDatabase, Unicode61, FTSTable, Table } from '@andrewitsover/midnight';
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
  emailId = this.Cascade(Emails);
}

const database = new SQLiteDatabase(':memory:');
const db = database.getClient({ Emails, Tests });
const sql = db.diff();
db.migrate(sql);

db.emails.insert({
  from: 'andrew@gmail.com',
  to: 'elon@gmail.com',
  body: 'When is my CyberTruck arriving?'
});
db.emails.insert({
  from: 'elon@gmail.com',
  to: 'andrew@gmail.com',
  body: 'Very soon. We are adding the afterburners.'
});
db.emails.insert({
  from: 'dhh@hey.com',
  to: 'andrew@gmail.com',
  body: 'When are you going to install Omarchy?'
});
db.emails.insert({
  from: 'andrew@gmail.com',
  to: 'dhh@hey.com',
  body: 'When I finish my current project.'
});

test('and startsWith', () => {
  const emails = db.emails.match({
    return: 'rowid',
    where: {
      body: {
        and: [{ startsWith: 'When' }, 'project']
      }
    }
  });
  assert.equal(emails.at(0), 4);
});

test('or', () => {
  const emails = db.emails.match({
    or: ['CyberTruck', 'Omarchy']
  });
  assert.equal(emails.length, 2);
});

test('near', () => {
  const distance = (n) => {
    const result = db.emails.match({
      near: ['finish', 'project', n]
    });
    return result.length > 0;
  }
  const fail = distance(1);
  const pass = distance(2);
  assert.equal(fail, false);
  assert.equal(pass, true);
});

test('log', () => {
  let data;
  db.emails.match({
    phrase: 'CyberTruck',
    log: (info) => data = info
  });
  assert.equal(typeof data.sql, 'string');
});
