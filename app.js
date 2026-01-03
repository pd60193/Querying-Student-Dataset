import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { mysql_grammar } from './grammar.js';
import { generateQuery } from './openai.js';
import { queryDataSource } from './tinybird.js';

const app = express();
const port = 3000;


// Recreate __dirname for ES module scope
const __filename = fileURLToPath(
  import.meta.url);
const __dirname = path.dirname(__filename);

// Serve only the static files/assets from the public directory.
app.use(express.static(path.join(__dirname, 'public')));

// For any other request which does not start with /api, serve index.html
app.get(/^\/(?!api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Needed to parse post body.
app.use(express.json());

// /api/query queries the clickhouse dataset through tinybird.
app.post('/api/query', async (req, res) => {
  try {
    // extract and validate post body i.e. prompt text.
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).send({
        error: "Missing 'prompt' in request body"
      });
    }

    // call OpenAI to generate a SQL query
    const query = await generateQuery(prompt, mysql_grammar);

    // call tinybird client to execute the query
    const data = await queryDataSource(query);
    console.log(data);

    // send data back to client.
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Listen on a given port.
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});