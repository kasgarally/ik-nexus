// Author: Karmil Asgarally - INTELLEKTRA © 2026
// Mongo replica-set bootstrap
// Single-node replica set required by Meteor 3.5 change streams.
function isPrimary() {
  try {
    const status = rs.status();
    return status.ok === 1 && status.members.some((member) => member.stateStr === 'PRIMARY');
  } catch (error) {
    return false;
  }
}

if (!isPrimary()) {
  try {
    rs.initiate({
      _id: 'rs0',
      members: [{ _id: 0, host: 'mongo:27017' }],
    });
  } catch (error) {
    print(error);
  }
}

const deadline = Date.now() + 30000;
while (!isPrimary()) {
  if (Date.now() > deadline) {
    throw new Error('Replica set rs0 did not become PRIMARY in time');
  }
  sleep(1000);
}

print('Replica set rs0 is PRIMARY');
