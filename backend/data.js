// backend/data.js
let resources = [
    { id: 1, name: 'Resource A', description: 'Description for Resource A' },
    { id: 2, name: 'Resource B', description: 'Description for Resource B' },
    { id: 3, name: 'Resource C', description: 'Description for Resource C' },
    { id: 4, name: 'Resource D', description: 'Description for Resource D' },
    { id: 5, name: 'Resource E', description: 'Description for Resource E' },
];

module.exports = {
    resources,
    addResource: (name, description) => {
        const newResource = {
            id: resources.length > 0 ? Math.max(...resources.map(r => r.id)) + 1 : 1,
            name,
            description,
        };
        resources.push(newResource);
        return newResource;
    },
    getResourceById: (id) => {
        return resources.find(r => r.id === id);
    },
    // We'll primarily focus on Query, Mutation (add), and Streaming for comparison
};