const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/csv-parser', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the schema and model for the CSV data
const { Schema } = mongoose;
const CSVSchema = new Schema({
  rows: [{ type: Object }],
});
const CSV = mongoose.model('CSV', CSVSchema);

// Initialize ExpressJS
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Initialize Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define the API endpoint for importing CSV files
app.post('/import', upload.single('file'), async (req, res) => {
  if (req.file.size > 5000 * 1024) {
    return res.status(400).send('File is too large');
  }

  if (req.file.mimetype !== 'text/csv') {
    return res.status(400).send('Invalid file format');
  }

  const csvRows = req.file.buffer.toString().split('\n');
  const csvData = [];

  for (const row of csvRows) {
    csvData.push(row.split(','));
  }

  const csv = new CSV({ rows: csvData });
  await csv.save();

  res.send({ requestId: csv._id });
});

// Define the API endpoint for retrieving CSV data
app.get('/data/:requestId', async (req, res) => {
  const csv = await CSV.findById(req.params.requestId);

  if (!csv) {
    return res.status(404).send('CSV not found');
  }

  res.send(csv.rows);
});

// Initialize the HTTP server and WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const { requestId, progress } = JSON.parse(message);

    if (requestId && progress) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ requestId, progress }));
        }
      });
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});