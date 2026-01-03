import { strict as assert } from 'assert';
import { test, cleanUp } from '../run.js';
import { db } from '../drivers/sqlite.js';

test('transactions', async () => {
  let javierId;
  let tx;
  try {
    tx = await db.begin();
    javierId = await tx.coaches.insert({
      name: 'Javier Mendez',
      city: 'San Jose'
    });
    throw Error();
  }
  catch {
    await tx.rollback();
  }
  let javier = await db.coaches.get({ id: javierId });
  assert.equal(javier, undefined);

  try {
    tx = await db.begin();
    javierId = await tx.coaches.insert({
      name: 'Javier Mendez',
      city: 'San Jose'
    });
    await tx.commit();
  }
  catch {
    await tx.rollback();
  }
  javier = await db.coaches.get({ id: javierId });
  assert.notEqual(javier, undefined);
  await db.coaches.delete({ id: javierId });

  await db.coaches.insertMany([
    {
      name: 'Eugene Bareman',
      city: 'Auckland'
    },
    {
      name: 'Trevor Wittman',
      city: 'Denver'
    },
  ]);
  let coaches = await db.coaches.many();
  assert.equal(coaches.length, 2);
  await db.coaches.delete({ name: 'Eugene Bareman' });
  coaches = await db.coaches.many();
  assert.equal(coaches.length, 1);
  await db.coaches.delete();

  const methodCount = await db.fights.count({
    where: {
      methodId: null
    }
  });
  assert.equal(methodCount, 45);

  const wait = async (time = 100) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), 100);
    });
  }
  const t1 = async () => {
    const tx = await db.begin();
    await tx.coaches.insert({
      name: 'Test User',
      city: 'Whatever'
    });
    await wait();
    await tx.commit();
  }
  const t2 = async () => {
    const tx = await db.begin();
    await tx.coaches.insert({
      name: 'Test User 2',
      city: 'Whatever 2'
    });
    await tx.commit();
  }
  const promises = [t1(), t2()];
  await Promise.all(promises);
  await db.coaches.delete();
  await db.batch(tx => {
    const coach = tx.coaches.insert({
      name: 'Test',
      city: 'Test'
    });
    const fighter = tx.fighters.insert({
      name: 'Test',
      hometown: 'Test',
      isActive: false
    });
    return [coach, fighter];
  });
  const count = await db.coaches.count();
  assert.equal(count, 1);
  const t3 = async () => {
    const tx = await db.begin();
    await tx.coaches.insert({ name: 'Test', city: 'Test '});
    await wait();
    await tx.rollback();
  }
  const promise = t3();
  await wait(30);
  const during = await db.coaches.count();
  await promise;
  const after = await db.coaches.count();
  assert.equal(during, after);
  await db.coaches.delete();
  await db.fighters.delete({ name: 'Test', hometown: 'Test', isActive: false });
});

cleanUp('transactions', async () => {
  await db.coaches.delete();
});
