// backend/grpc/grpc_server.js
const path = require('path');
const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const { resources, addResource, getResourceById } = require('../data');

const PROTO_PATH = path.join(__dirname, 'comparison.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const comparison_proto = grpc.loadPackageDefinition(packageDefinition).comparison;

function getResource(call, callback) {
    const resource = getResourceById(call.request.id);
    if (resource) {
        callback(null, resource);
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: `Resource with ID ${call.request.id} not found`
        });
    }
}

function createResource(call, callback) {
    const { name, description } = call.request;
    const newResource = addResource(name, description);
    callback(null, newResource);
}

function streamResources(call) {
    // OLD CODE
    // const { count, delayMs } = call.request;
    // let sentCount = 0;
    // const interval = setInterval(() => { ... });

    // NEW CODE - Runs as fast as possible
    const { count } = call.request;
    for (let i = 0; i < count; i++) {
        // Send a random resource from our existing data
        const resourceToSend = resources[Math.floor(Math.random() * resources.length)];
        call.write(resourceToSend);
    }
    call.end(); // Signal that the stream is complete
}

module.exports = {
    comparison_proto,
    service: {
        GetResource: getResource,
        CreateResource: createResource,
        StreamResources: streamResources
    }
};