require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes');

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
};

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const database = process.env.DB_DATABASE;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

const uri = `mongodb://${username}:${password}@${host}:${port}/${database}`;
const db = mongoose.connect(uri, options);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/v1', routes);

app.listen(3000, () => {
  if (process.env.NODE_ENV != 'test')
  console.log(`App started on port 3000`);
});

// For running tests
module.exports = app;
