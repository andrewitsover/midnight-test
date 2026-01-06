import { strict as assert } from 'assert';
import { test, cleanUp } from '../run.js';
import { db } from '../drivers/sqlite.js';

test('transactions', async () => {
  let javierId;
  try {
    db.begin();
    javierId = db.coaches.insert({
      name: 'Javier Mendez',
      city: 'San Jose'
    });
    throw Error();
  }
  catch {
    db.rollback();
  }
  let javier = db.coaches.get({ id: javierId });
  assert.equal(javier, undefined);

  try {
    db.begin();
    javierId = db.coaches.insert({
      name: 'Javier Mendez',
      city: 'San Jose'
    });
    db.commit();
  }
  catch {
    db.rollback();
  }
  javier = db.coaches.get({ id: javierId });
  assert.notEqual(javier, undefined);
  db.coaches.delete({ id: javierId });

  db.coaches.insertMany([
    {
      name: 'Eugene Bareman',
      city: 'Auckland'
    },
    {
      name: 'Trevor Wittman',
      city: 'Denver'
    },
  ]);
  let coaches = db.coaches.many();
  assert.equal(coaches.length, 2);
  db.coaches.delete({ name: 'Eugene Bareman' });
  coaches = db.coaches.many();
  assert.equal(coaches.length, 1);
  db.coaches.delete();

  const methodCount = db.fights.count({
    where: {
      methodId: null
    }
  });
  assert.equal(methodCount, 45);
});

cleanUp('transactions', async () => {
  db.coaches.delete();
});
