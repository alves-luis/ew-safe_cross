db = db.getSiblingDB('crosswalkshistory');
db.createUser(
  {
    user: 'admin',
    pwd: 'pass',
    roles: [
      {
        role: 'readWrite',
        db: 'crosswalkshistory'
      }
    ]
  }
);
