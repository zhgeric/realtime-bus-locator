const express = require('express');
const cors = require('cors');
const app = express();
let latestLocation = null;

app.use(cors());

app.get('/location', (req, res) => {
  if (latestLocation) {
    res.json(latestLocation);
  } else {
    res.status(404).send('No data available');
  }
});

app.post('/location', express.json(), (req, res) => {
  latestLocation = req.body;
  res.status(200).send('Location updated');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});