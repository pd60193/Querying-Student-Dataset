import { createClient } from '@clickhouse/client'

const tinybirdClient = createClient({
  url: 'https://clickhouse.us-east.tinybird.co',
  username: 'dhanukapriyam_workspace', // Optional, for identification
  password: 'p.eyJ1IjogIjUyMzM5MDNjLWE0NTgtNGIyYS1hZWJhLWJhYjQzNzhjZmI4ZCIsICJpZCI6ICIwYjA2NmZmMS04ODUyLTQzN2ItYmM0Yi0wOTExNDcyZjNhOWUiLCAiaG9zdCI6ICJ1c19lYXN0In0.SdQFF17ANYyi2z1RFe2Ub_hzpTFwmnjfD72WbbuKEco', // Your Tinybird Auth Token
});

export async function queryDataSource(query) {
  const resultSet = await tinybirdClient.query({
    query: query,
  });

  const data = await resultSet.json();
  return data.data;
}