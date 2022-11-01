require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const dns = require('node:dns');

const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// POST - short URL
let shortUrls = [];
function addShortUrl(req, res) {
  const error = 'invalid url';
  const rawUrl = req.body.url;
  console.log(`Add short url: ${rawUrl}`);
  let url = null;
  try {
    url = new URL(rawUrl);
  } catch(err) {
    console.error(`Unable to convert raw url: ${rawUrl} to URL object`);
    res.json({error});
    return;
  }
  const options = {
    hints: dns.ADDRCONFIG | dns.V4MAPPED
  }
  dns.lookup(url.hostname, (err, options, addresses) => {
    if (err) {
      console.error(`DNS lookup failed with url: ${url.hostname}`);
      res.json({ error });
    } else {
      const index = shortUrls.length;
      shortUrls.push(url.toString());
      res.json({
        original_url: shortUrls[index],
        short_url: index
      });
    }
  });
}

function browseShortUrl(req, res) {
  const error = 'No short URL found for the given input';
  const shortUrl = req.params.shortUrl;
  console.log(`Browse short URL: ${shortUrl}`);

  if (isNaN(Number(shortUrl))) { /*if shortUrl is not number*/
    res.json({ error });
    return;
  }
  if (shortUrl >= shortUrls.length || shortUrls.length <= 0) { /*if shortUrl doesn't exist*/
    res.json({ error });
    return;
  }

  const redirectUrl = shortUrls[shortUrl];
  res.redirect(redirectUrl);
}

app.post('/api/shorturl', addShortUrl);
app.get('/api/shorturl/:shortUrl?', browseShortUrl);



app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
