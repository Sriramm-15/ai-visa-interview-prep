const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.get('/api/feedback', (req, res) => {
  res.json({ message: 'Feedback received!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
