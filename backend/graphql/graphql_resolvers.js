// backend/graphql/graphql_resolvers.js
const { resources, addResource, getResourceById } = require('../data');

const root = {
    getResource: ({ id }) => {
        return getResourceById(id);
    },
    getAllResources: () => {
        return resources;
    },
    createResource: ({ name, description }) => {
        return addResource(name, description);
    },
    // For streaming, a simple mock that returns resources sequentially
    // In a real GraphQL app, you'd integrate with PubSub or a similar mechanism.
    /*streamResources: async function*({ count, delayMs = 10 }) {
        let sentCount = 0;
        while (sentCount < count) {
            // Send a random resource from our existing data
            const resourceToSend = resources[Math.floor(Math.random() * resources.length)];
            yield { streamResources: resourceToSend }; // Yield the event
            sentCount++;
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }*/
   // NEW CODE - A synchronous generator that runs at full speed
    streamResources: function*({ count }) { // Removed async and delayMs
    let sentCount = 0;
    while (sentCount < count) {
        const resourceToSend = resources[Math.floor(Math.random() * resources.length)];
        yield { streamResources: resourceToSend };
        sentCount++;
        // No more "await new Promise" delay
    }
}
};

module.exports = root;