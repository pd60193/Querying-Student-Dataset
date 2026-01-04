import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { mysql_grammar } from './services/grammar.js';
import { generateQuery } from './services/openai.js';
import { queryDataSource } from './services/tinybird.js';

const app = express();
const port = process.env.PORT || 3000;

// Recreate __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve only the static files/assets from the public directory.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// For any other request which does not start with /api, serve index.html
app.get(/^\/(?!api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// /api/query queries the clickhouse dataset through tinybird.
app.post('/api/query', async (req, res) => {
  try {
    // extract and validate post body i.e. prompt text.
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).send({ error: "Missing 'prompt' in request body" });
    }

    console.log(`Processing prompt: ${prompt}`);

    // call OpenAI to generate a SQL query
    const query = await generateQuery(prompt, mysql_grammar);

    if (!query) {
      return res.status(422).send({ error: "Failed to generate a valid query from prompt." });
    }

    console.log(`Generated Query: ${query}`);

    // call tinybird client to execute the query
    const data = await queryDataSource(query);
    res.send(data);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).send({ error: error.message });
  }
});

// Listen on a given port.
app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});
