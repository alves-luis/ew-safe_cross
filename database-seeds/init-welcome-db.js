db = db.getSiblingDB('welcome');
db.createUser(
  {
    user: 'admin',
    pwd: 'pass',
    roles: [
      {
        role: 'readWrite',
        db: 'welcome'
      }
    ]
  }
);
