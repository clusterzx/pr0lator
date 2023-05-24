const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const { URL } = require('url');

// Create Express app
const app = express();
const port = 80;

// Use the body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static('public'));

// Define a route to execute the Python script
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/convert', async (req, res) => {
    const url = req.body.url;
    const output = req.body.option;
    const lang = "en"
    console.log(url);
  
    try {
      // Parse the URL and extract the host
      const parsedUrl = new URL(url);
      const host = parsedUrl.hostname;
  
      // Check if the host is "pr0gramm.com"
      if (!['videos.pr0gramm.com', 'vid.pr0gramm.com'].includes(host)) {
        res.status(400).send('Invalid URL. Only pr0gramm.com URLs are allowed.');
        return;
      }
  
      // Fetch the file size of the URL
      const response = await axios.head(url);
      const fileSize = Number(response.headers['content-length']);
  
      // Check if the file size is under 40MB (40 * 1024 * 1024 bytes)
      if (fileSize > 40 * 1024 * 1024) {
        res.status(400).send('File size exceeds the limit of 40MB.');
        return;
      }
  
      // Execute the python script with the URL, output and lang as an argument
      exec(`python3 convert.py ${url} ${output} ${lang}`, (err, stdout, stderr) => {
        if (err) {
          console.log(err);
          res.status(500).send('An error occurred while converting the file.');
          return;
        }
        // The script will print the name of the file once it's done
        //get last line of stdout
        var lines = stdout.split("\n");
        stdout = lines[lines.length - 2];
        console.log(stdout);
        // Send the file name back to the client
        res.send(stdout);
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('An error occurred while processing the URL.');
    }
  });

app.get('/watch2/:id', (req, res) => {
    const id = req.params.id;
    res.sendFile(__dirname + `/media/${id}`);
});

app.get('/watch/:id', (req, res) => {
  const id = req.params.id;
  res.sendFile(__dirname + '/watch.html');
});

app.get('/bootstrap.min.css', (req, res) => {
    res.sendFile(__dirname + '/bootstrap.min.css');
});

app.get('/63127664_1006.jpg', (req, res) => {
    res.sendFile(__dirname + '/63127664_1006.jpg');
});

app.get("/download/:id", (req, res) => {
    const id = req.params.id;
    res.download(__dirname + `/${id}`);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});