import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the raw lark file from the root
const grammarPath = path.join(__dirname, '../mysql_grammar.lark');
export const mysql_grammar = fs.readFileSync(grammarPath, 'utf8');