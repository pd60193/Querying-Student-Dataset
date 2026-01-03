import { createClient } from '@clickhouse/client'

const tinybirdClient = createClient({
  url: 'https://clickhouse.us-east.tinybird.co',
  username: 'dhanukapriyam_workspace', // Optional, for identification
  password: 'xx', // Your Tinybird Auth Token
});

export async function queryDataSource(query) {
  const resultSet = await tinybirdClient.query({
    query: query,
  });

  const data = await resultSet.json();
  return data.data;
}