'use strict';

const express = require('express');

const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});

if (module === require.main) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
    console.log('Press Ctrl+C to quit.');
  });
}

module.exports = app;
