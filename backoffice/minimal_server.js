const express = require('express');
const app = express();
const PORT = 3029;

app.get('/test', (req, res) => {
  res.json({ message: 'Server works!', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});