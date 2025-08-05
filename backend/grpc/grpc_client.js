// backend/grpc/grpc_client.js
const path = require('path');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');

const PROTO_PATH = path.join(__dirname, 'comparison.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const comparison_proto = grpc.loadPackageDefinition(packageDefinition).comparison;

// The gRPC server will run on a different port than the Express server
const GRPC_SERVER_ADDRESS = 'localhost:50051'; // A common port for gRPC

const client = new comparison_proto.ComparisonService(GRPC_SERVER_ADDRESS, grpc.credentials.createInsecure());

module.exports = {
    client,
    // Add methods to wrap client calls for easier benchmarking
    getResource: (id) => {
        return new Promise((resolve, reject) => {
            client.GetResource({ id }, (error, response) => {
                if (error) return reject(error);
                resolve(response);
            });
        });
    },
    createResource: (name, description) => {
        return new Promise((resolve, reject) => {
            client.CreateResource({ name, description }, (error, response) => {
                if (error) return reject(error);
                resolve(response);
            });
        });
    },
     streamResources: (count) => { // Removed delayMs from function signature
        return new Promise((resolve, reject) => {
            // Pass only the 'count' parameter in the request object
            const call = client.StreamResources({ count }); 
            const receivedResources = [];
            call.on('data', (resource) => {
                receivedResources.push(resource);
            });
            call.on('end', () => {
                resolve(receivedResources);
            });
            call.on('error', (e) => {
                reject(e);
            });
        });
    }
};