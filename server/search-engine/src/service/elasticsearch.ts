import { Client } from "@elastic/elasticsearch";

function elasticConnection() {
  // Get connection credentials
  const endNode = `${process.env.ELASTIC_SEARCH_NODE_END_POINT}`;
  const apiKey = `${process.env.ELASTIC_SEARCH_API_KEY}`;

  // check
  if (!endNode || !apiKey) {
    throw new Error(
      `Elastic environment variables ELASTIC_SEARCH_NODE_END_POINT & ELASTIC_SEARCH_API_KEY are required`
    );
  }

  // create elastic client client
  const elasticClient = new Client({
    node: endNode,
    auth: {
      apiKey: apiKey,
    },
    requestTimeout: 60000, // Increase to 60 seconds
  });

  return elasticClient;
}

export default elasticConnection;
