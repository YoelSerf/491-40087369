// backend/server.js
const express = require('express');
const cors = require('cors');
const { createHandler } = require('graphql-http/lib/use/express');
const grpc = require('@grpc/grpc-js');

// Internal modules
const { comparison_proto, service: grpcServiceHandlers } = require('./grpc/grpc_server');
const graphqlSchema = require('./graphql/graphql_schema');
const graphqlResolvers = require('./graphql/graphql_resolvers');
const { runComparison, getBenchmarkResults } = require('./benchmark_service');

const app = express();
app.use(cors());
app.use(express.json());

const HTTP_PORT = 5000;
const GRPC_PORT = 50051;

// --- gRPC Server Setup ---
const grpcServer = new grpc.Server();
grpcServer.addService(comparison_proto.ComparisonService.service, grpcServiceHandlers);
grpcServer.bindAsync(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) return console.error('Failed to bind gRPC server:', err);
    console.log(`gRPC server listening on port ${port}`);
});

// --- GraphQL Endpoint Setup ---
app.use('/graphql', createHandler({ schema: graphqlSchema, root: graphqlResolvers, graphiql: true }));

// --- API Endpoints ---
app.post('/api/run-benchmark', async (req, res) => {
    try {
        // This now correctly calls runComparison without arguments.
        const results = await runComparison();
        res.json({ success: true, message: 'Benchmark completed.', results });
    } catch (error) {
        console.error('Error running benchmark:', error);
        res.status(500).json({ success: false, message: 'Benchmark failed', error: error.message });
    }
});

app.get('/api/results', (req, res) => {
    const results = getBenchmarkResults();
    if (Object.keys(results).length === 0) {
        return res.status(404).json({ message: 'No benchmark results available.' });
    }
    res.json(results);
});

// --- Start Express Server ---
app.listen(HTTP_PORT, () => {
    console.log(`Express server (HTTP) listening on port ${HTTP_PORT}`);
    console.log(`GraphiQL UI available at http://localhost:${HTTP_PORT}/graphql`);
    console.log(`API endpoints:\n  POST http://localhost:${HTTP_PORT}/api/run-benchmark\n  GET  http://localhost:${HTTP_PORT}/api/results`);
});