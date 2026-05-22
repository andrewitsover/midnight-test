import { Table, Database } from '@andrewitsover/midnight';
import { test } from '../run.js';
import { strict as assert } from 'assert';

class Users extends Table {
  name;
  documents = this.TypedArray({
    id: this.Int,
    contents: this.Text,
    createdAt: this.ZonedDateTime,
    authors: this.TypedArray(this.Text)
  });
}

const database = new Database(':memory:');
const db = database.getClient({ Users });
const sql = db.diff();
db.migrate(sql);

test('typed array', async () => {
  const now = Temporal.Now.zonedDateTimeISO();
  const authors = ['Andrew', 'Penelope'];
  const documents = [
    { id: 1, contents: 'It was raining when we arrived.', createdAt: now, authors },
    { id: 2, contents: 'We came to the house unprepared.', createdAt: now.add({ days: 1 }), authors }
  ];
  const user = db.users.returnInsert({ name: 'Andrew', documents });
  assert.equal(user.documents.at(0).authors.length, 2);
});
