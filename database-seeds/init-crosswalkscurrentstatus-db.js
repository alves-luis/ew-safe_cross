db = db.getSiblingDB('crosswalkscurrentstatus');
db.createUser(
  {
    user: 'admin',
    pwd: 'pass',
    roles: [
      {
        role: 'readWrite',
        db: 'crosswalkscurrentstatus'
      }
    ]
  }
);