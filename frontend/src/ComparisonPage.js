// frontend/ComparisonPage.js
import React, { useState } from 'react';
import axios from 'axios';
// Import BOTH Line and Bar chart types
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ALL necessary components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

ChartJS.defaults.color = '#e8e6e3';
ChartJS.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

const BACKEND_URL = 'http://localhost:5000';

const ComparisonPage = () => {
    const [benchmarkResults, setBenchmarkResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const runBenchmark = async () => {
        setIsLoading(true);
        setError('');
        setBenchmarkResults(null);
        try {
            const response = await axios.post(`${BACKEND_URL}/api/run-benchmark`);
            setBenchmarkResults(response.data.results);
        } catch (err)            {
            setError('Failed to run benchmark. Is the backend server running?');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function for SCALABILITY LINE CHARTS
    const createScalabilityChartData = (metric, operation) => {
        if (!benchmarkResults?.grpc?.scalability?.[operation]) return null;
        const grpcData = benchmarkResults.grpc.scalability[operation];
        const graphqlData = benchmarkResults.graphql.scalability[operation];
        const labels = grpcData.map(d => d.concurrency);
        return {
            labels,
            datasets: [
                { label: 'gRPC', data: grpcData.map(d => d[metric]), borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.5)', tension: 0.1 },
                { label: 'GraphQL', data: graphqlData.map(d => d[metric]), borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.5)', tension: 0.1 },
            ],
        };
    };

    // Helper function for STREAMING BAR CHARTS
    const createStreamingBarChartData = (metric) => {
        if (!benchmarkResults?.grpc?.streaming) return null;
        return {
            labels: ['Streaming'],
            datasets: [
                { label: 'gRPC', data: [benchmarkResults.grpc.streaming[metric]], backgroundColor: 'rgba(75, 192, 192, 0.6)' },
                { label: 'GraphQL', data: [benchmarkResults.graphql.streaming[metric]], backgroundColor: 'rgba(255, 99, 132, 0.6)' },
            ]
        }
    };

    const queryLatencyData = createScalabilityChartData('avgLatency', 'query');
    const mutationLatencyData = createScalabilityChartData('avgLatency', 'mutation');
    const queryThroughputData = createScalabilityChartData('throughput', 'query');
    const mutationThroughputData = createScalabilityChartData('throughput', 'mutation');
    const streamingLatencyData = createStreamingBarChartData('avgLatency');
    const streamingThroughputData = createStreamingBarChartData('throughput');


    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <button onClick={runBenchmark} disabled={isLoading} style={{fontSize: '1.2em', padding: '10px 20px'}}>
                    {isLoading ? 'Running Full Benchmark...' : 'Start Full Benchmark'}
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>

            {benchmarkResults && (
                <>
                    {/* --- SCALABILITY CHARTS SECTION --- */}
                    <div className="scalability-section" style={{marginBottom: '50px'}}>
                        <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Scalability Under Load</h2>
                        <div className="charts-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '40px' }}>
                            {queryLatencyData && ( <div> <h3>Query Latency vs. Concurrency</h3> <p style={{fontSize: '0.9em', color: '#aaa'}}>How batch latency changes as concurrent users increase. Lower is better.</p> <Line options={{ responsive: true, plugins: { title: { display: true, text: 'Batch Latency (ms)' } }, scales: { x: { title: { display: true, text: 'Concurrent Users' } } } }} data={queryLatencyData} /> </div> )}
                            {queryThroughputData && ( <div> <h3>Query Throughput vs. Concurrency</h3> <p style={{fontSize: '0.9em', color: '#aaa'}}>How total throughput changes as concurrent users increase. Higher is better.</p> <Line options={{ responsive: true, plugins: { title: { display: true, text: 'Throughput (ops/s)' } }, scales: { x: { title: { display: true, text: 'Concurrent Users' } } } }} data={queryThroughputData} /> </div> )}
                            {mutationLatencyData && ( <div> <h3>Mutation Latency vs. Concurrency</h3> <p style={{fontSize: '0.9em', color: '#aaa'}}>How batch latency changes as concurrent users increase. Lower is better.</p> <Line options={{ responsive: true, plugins: { title: { display: true, text: 'Batch Latency (ms)' } }, scales: { x: { title: { display: true, text: 'Concurrent Users' } } } }} data={mutationLatencyData} /> </div> )}
                            {mutationThroughputData && ( <div> <h3>Mutation Throughput vs. Concurrency</h3> <p style={{fontSize: '0.9em', color: '#aaa'}}>How total throughput changes as concurrent users increase. Higher is better.</p> <Line options={{ responsive: true, plugins: { title: { display: true, text: 'Throughput (ops/s)' } }, scales: { x: { title: { display: true, text: 'Concurrent Users' } } } }} data={mutationThroughputData} /> </div> )}
                        </div>
                    </div>

                    {/* --- DATA DELIVERY MODELS SECTION --- */}
                    <div className="streaming-section" style={{ padding: '30px 0', borderTop: '2px solid #333' }}>
                        {/* THIS IS THE CHANGED LINE */}
                        <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Data Delivery Models: True Stream vs. Batch Request</h2>
                        <div className="charts-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', alignItems: 'start' }}>
                             {streamingLatencyData && (
                                <div>
                                    <h3>Total Time to Receive 100 Items</h3>
                                    <p style={{fontSize: '0.9em', color: '#aaa'}}>A single operation to get all items. Lower is better.</p>
                                    <Bar options={{ responsive: true, plugins: { title: { display: true, text: 'Total Time (ms)' } } }} data={streamingLatencyData} />
                                </div>
                            )}
                            {streamingThroughputData && (
                                <div>
                                    <h3>Items Delivered per Second</h3>
                                    <p style={{fontSize: '0.9em', color: '#aaa'}}>Calculated as total items / total time. Higher is better.</p>
                                    <Bar options={{ responsive: true, plugins: { title: { display: true, text: 'Throughput (items/s)' } } }} data={streamingThroughputData} />
                                </div>
                            )}
                            {benchmarkResults.cpuUsage && (
                                <div>
                                    <h3>Overall CPU & Memory</h3>
                                    <p style={{fontSize: '0.9em', color: '#aaa'}}>Resource usage across all tests combined.</p>
                                    <div style={{ background: '#2a2d32', padding: '15px', borderRadius: '8px', boxSizing: 'border-box' }}>
                                        <p><strong>Initial CPU:</strong> {benchmarkResults.cpuUsage.initial.cpu}%</p>
                                        <p><strong>Final CPU:</strong> {benchmarkResults.cpuUsage.final.cpu}%</p>
                                        <p><strong>Average CPU Usage:</strong> {benchmarkResults.cpuUsage.average}%</p>
                                        <hr style={{borderColor: '#444'}}/>
                                        <p><strong>Memory Usage:</strong> {benchmarkResults.cpuUsage.final.memory} MB</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Analysis & Ergonomics Section */}
                    <div className="analysis-section" style={{ marginTop: '50px', paddingTop: '30px', borderTop: '2px solid #333' }}>
                        <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Analysis & Use Cases</h2>
                        <div style={{ background: '#2a2d32', padding: '20px 40px', borderRadius: '8px', lineHeight: '1.6', fontSize: '1.05em' }}>
                            <h4 style={{marginTop: '10px', textDecoration: 'underline', textUnderlineOffset: '4px'}}>Scalability: gRPC's Clear Advantage Under Pressure</h4>
                            <p>The scalability charts tell the most critical story for production systems. As the number of concurrent users increases, gRPC's performance remains highly efficient and predictable, while GraphQL's performance degrades significantly.</p>
                            <ul style={{listStyleType: 'none', paddingLeft: '0'}}>
                                <li><strong>Latency:</strong> gRPC's latency scales linearly and gracefully. In contrast, GraphQL's latency shows an exponential curve, indicating that the server struggles to handle the increasing load.</li>
                                <li style={{marginTop: '10px'}}><strong>Throughput:</strong> gRPC's throughput scales effectively—as more users are added, the server successfully processes more requests per second. GraphQL's throughput quickly plateaus or flattens, a classic sign of a performance bottleneck where adding more users does not result in more work getting done. This is likely due to the higher overhead of parsing text-based queries and serializing JSON in the single-threaded Node.js environment.</li>
                            </ul>
                            <h4 style={{marginTop: '25px', textDecoration: 'underline', textUnderlineOffset: '4px'}}>Data Delivery: True Stream (gRPC) vs. Batch Request (GraphQL)</h4>
                            <p>The charts above highlight a fundamental architectural difference. GraphQL appears dramatically faster, but this is because it's performing a different task.</p>
                            <ul style={{listStyleType: 'none', paddingLeft: '0'}}>
                                <li><strong>gRPC (True Stream):</strong> It establishes a persistent connection and sends each of the 100 items as a distinct message. This is a true streaming architecture, ideal for real-time, event-driven applications.</li>
                                <li style={{marginTop: '10px'}}><strong>GraphQL (Batch Request):</strong> In this test, it processes all 100 items in memory and sends them back as a single array in one HTTP response. This is a highly efficient batch operation, not a stream, explaining its extremely low latency.</li>
                            </ul>
                            <h4 style={{marginTop: '25px', textDecoration: 'underline', textUnderlineOffset: '4px'}}>When to Choose Which?</h4>
                            <ul style={{listStyleType: 'none', paddingLeft: '0'}}>
                                <li><strong>Choose gRPC when...</strong><ul style={{listStyleType: 'none', paddingLeft: '20px'}}><li><strong>High-performance scalability</strong> is the top priority for many concurrent users.</li><li>You are building internal, polyglot microservices that need to communicate with maximum efficiency.</li><li>You need true, low-latency bi-directional streaming for applications like IoT or real-time chat.</li><li>A strict, versioned API contract is essential for stability.</li></ul></li>
                                <li style={{marginTop: '10px'}}><strong>Choose GraphQL when...</strong><ul style={{listStyleType: 'none', paddingLeft: '20px'}}><li>You have a public-facing API for diverse clients (e.g., web, mobile) where <strong>flexibility is key</strong>.</li><li>The primary goal is to <strong>reduce the number of network requests</strong> by fetching complex data in a single call (batching).</li><li>Your front-end team needs to iterate quickly without waiting for backend API changes.</li><li><strong>Developer experience</strong> and rapid prototyping are more important than raw, high-concurrency performance.</li></ul></li>
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ComparisonPage;
