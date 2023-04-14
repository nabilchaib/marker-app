const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const apiRouter = require('./api');

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/api', apiRouter);



// Serve static files
app.use(express.static(path.join(__dirname, '../build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
