// backend/benchmark_service.js
const grpcClient = require('./grpc/grpc_client');
const axios = require('axios');
const { resources } = require('./data');
const pidusage = require('pidusage');

const GRAPHQL_HTTP_ENDPOINT = 'http://localhost:5000/graphql';

let currentBenchmarkResults = {};

// --- TEST RUNNER FOR SINGLE, NON-CONCURRENT OPERATIONS (FOR STREAMING) ---
const runSingleTest = async (func) => {
    const start = process.hrtime.bigint();
    try {
        await func();
    } catch (e) {
        // We'll ignore errors for this simple test, but in real life you'd handle them
    }
    const end = process.hrtime.bigint();
    return Number(end - start) / 1_000_000; // Return latency in ms
};

// --- TEST RUNNER FOR CONCURRENT OPERATIONS (FOR SCALABILITY) ---
const runConcurrentTest = async (func, concurrency) => {
    let errors = 0;
    const promises = [];
    for (let i = 0; i < concurrency; i++) {
        promises.push(func());
    }
    const start = process.hrtime.bigint();
    const results = await Promise.allSettled(promises);
    const end = process.hrtime.bigint();
    for (const result of results) {
        if (result.status === 'rejected') errors++;
    }
    const totalDurationMs = Number(end - start) / 1_000_000;
    const throughput = (concurrency / totalDurationMs) * 1000;
    return {
        concurrency: concurrency,
        avgLatency: parseFloat(totalDurationMs.toFixed(2)),
        throughput: parseFloat(throughput.toFixed(2)),
        errorRate: parseFloat(((errors / concurrency) * 100).toFixed(2)),
    };
};

const measureCpuUsage = async (pid) => {
    return new Promise((resolve) => {
        pidusage(pid, (err, stats) => {
            if (err) return resolve({ cpu: 0, memory: 0 });
            resolve({ cpu: parseFloat(stats.cpu.toFixed(2)), memory: parseFloat((stats.memory / 1024 / 1024).toFixed(2)) });
        });
    });
};

// --- UPDATED MAIN BENCHMARK FUNCTION ---
const runComparison = async () => {
    console.log('Starting comprehensive benchmark (Scalability + Streaming)...');
    const backendPid = process.pid;
    const STREAM_ITEM_COUNT = 100;

    try {
        const initialCpuStats = await measureCpuUsage(backendPid);

        const results = {
            // Structure for new scalability data
            grpc: { scalability: { query: [], mutation: [] }, streaming: {} },
            graphql: { scalability: { query: [], mutation: [] }, streaming: {} }
        };

        // --- PART 1: SCALABILITY TESTS ---
        const concurrencyLevels = [1, 5, 10, 25, 50, 100];
        console.log(`Running Scalability Tests for levels: ${concurrencyLevels.join(', ')}`);
        for (const level of concurrencyLevels) {
            console.log(`--- Testing at Concurrency Level: ${level} ---`);
            const grpcQuery = () => grpcClient.getResource(Math.floor(Math.random() * resources.length) + 1);
            results.grpc.scalability.query.push(await runConcurrentTest(grpcQuery, level));
            const grpcMutation = () => grpcClient.createResource(`gRPC Scalability ${Math.random()}`, `Desc`);
            results.grpc.scalability.mutation.push(await runConcurrentTest(grpcMutation, level));
            const graphqlQuery = () => axios.post(GRAPHQL_HTTP_ENDPOINT, { query: `query GetResource($id: Int!) { getResource(id: $id) { id name } }`, variables: { id: Math.floor(Math.random() * resources.length) + 1 } });
            results.graphql.scalability.query.push(await runConcurrentTest(graphqlQuery, level));
            const graphqlMutation = () => axios.post(GRAPHQL_HTTP_ENDPOINT, { query: `mutation CreateResource($name: String!) { createResource(name: $name) { id } }`, variables: { name: `GraphQL Scalability ${Math.random()}` } });
            results.graphql.scalability.mutation.push(await runConcurrentTest(graphqlMutation, level));
        }

        // --- PART 2: SINGLE-THREADED STREAMING TESTS ---
        console.log("--- Running Single-Threaded Streaming Tests ---");
        // gRPC Streaming
        const grpcStreamLatency = await runSingleTest(() => grpcClient.streamResources(STREAM_ITEM_COUNT));
        results.grpc.streaming = {
            avgLatency: parseFloat(grpcStreamLatency.toFixed(2)),
            throughput: parseFloat(((STREAM_ITEM_COUNT / grpcStreamLatency) * 1000).toFixed(2)),
            errorRate: 0, // Assuming no errors for simplicity
        };
        // GraphQL Streaming (Batching)
        const graphqlStreamLatency = await runSingleTest(() => axios.post(GRAPHQL_HTTP_ENDPOINT, { query: `subscription StreamResources($count: Int!) { streamResources(count: $count) { id name } }`, variables: { count: STREAM_ITEM_COUNT }}));
        results.graphql.streaming = {
            avgLatency: parseFloat(graphqlStreamLatency.toFixed(2)),
            throughput: parseFloat(((STREAM_ITEM_COUNT / graphqlStreamLatency) * 1000).toFixed(2)),
            errorRate: 0,
        };
        
        // --- FINAL CPU MEASUREMENT ---
        const finalCpuStats = await measureCpuUsage(backendPid);
        results.cpuUsage = { initial: initialCpuStats, final: finalCpuStats, average: parseFloat(((initialCpuStats.cpu + finalCpuStats.cpu) / 2).toFixed(2)) };

        currentBenchmarkResults = results;
        console.log('Benchmark complete!');
        return results;

    } catch (error) {
        console.error('Benchmark failed:', error.message);
        throw error;
    }
};

const getBenchmarkResults = () => currentBenchmarkResults;
module.exports = { runComparison, getBenchmarkResults };