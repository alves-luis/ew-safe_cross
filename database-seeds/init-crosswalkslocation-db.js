db = db.getSiblingDB('crosswalkslocation');
db.createUser(
  {
    user: 'admin',
    pwd: 'pass',
    roles: [
      {
        role: 'readWrite',
        db: 'crosswalkslocation'
      }
    ]
  }
);
