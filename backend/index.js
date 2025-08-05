const express = require('express');
const cors = require('cors');
// gRPC and GraphQL setup will go here

const app = express();
app.use(cors());
const port = 5000;

// TODO: Implement gRPC server logic
// TODO: Implement GraphQL server logic

// TODO: Create endpoints to trigger the comparison tests and get the results

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});