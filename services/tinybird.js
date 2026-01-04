import { createClient } from '@clickhouse/client';

let clientInstance = null;

function getTinybirdClient() {
  if (clientInstance) return clientInstance;

  if (!process.env.TINYBIRD_URL || !process.env.TINYBIRD_PASSWORD) {
    throw new Error("Missing Tinybird credentials in .env file");
  }

  clientInstance = createClient({
    url: process.env.TINYBIRD_URL,
    username: process.env.TINYBIRD_USERNAME || 'default', 
    password: process.env.TINYBIRD_PASSWORD, 
  });
  
  return clientInstance;
}

export async function queryDataSource(query) {
  const client = getTinybirdClient();
  try {
    const resultSet = await client.query({ query: query });
    const data = await resultSet.json();
    return data.data;
  } catch (error) {
    console.error("Tinybird Query Error:", error);
    throw error;
  }
}