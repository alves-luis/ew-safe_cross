require('dotenv').config();
const express = require('express');
const routes = require('./routes/routes');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);

app.listen(3000, () => {
  if (process.env.NODE_ENV != 'test')
    console.log(`App started on port 3000`);
});

// For running tests
module.exports = app;
