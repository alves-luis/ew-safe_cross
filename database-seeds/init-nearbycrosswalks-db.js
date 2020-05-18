db = db.getSiblingDB('nearbycrosswalks');
db.createUser(
  {
    user: 'admin',
    pwd: 'pass',
    roles: [
      {
        role: 'readWrite',
        db: 'nearbycrosswalks'
      }
    ]
  }
);