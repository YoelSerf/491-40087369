# gRPC vs. GraphQL: A Performance & Scalability Dashboard
This project is a full-stack application designed to provide a data-driven, visual comparison of gRPC and GraphQL. It moves beyond simple benchmarks to analyze and visualize their performance and scalability under realistic, concurrent user load.

## Project Abstract
This project provides a comparative study and implementation of GraphQL and gRPC services to evaluate their performance trade-offs in real-world scenarios. By building and benchmarking parallel services, the project focuses on two key areas:
1.  **Scalability Under Load:** How do latency and throughput degrade as the number of concurrent users increases?
2.  **Data Delivery Models:** What are the architectural differences between gRPC's true streaming and GraphQL's batch-request capabilities?

The final deliverable is this interactive dashboard, which demonstrates best practices for evaluating and selecting modern API technologies based on empirical evidence.

## Tech Stack
-   **Frontend:** React, Chart.js, Axios
-   **Backend:** Node.js, Express
-   **API Protocols:**
    -   gRPC (`@grpc/grpc-js`, `@grpc/proto-loader`)
    -   GraphQL (`graphql-http`)
-   **Benchmarking:** Custom concurrency logic using `Promise.allSettled`.

## Getting Started

Follow these instructions to get the project running.

### Prerequisites
-   Node.js (v14 or higher)
-   npm
-   Git

### Installation & Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YoelSerf/grpc-graphql-performance-dashboard.git
    cd grpc-graphql-performance-dashboard
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application
You will need two separate terminals to run both the backend and frontend servers.

1.  **Terminal 1: Start the Backend Server**
    ```bash
    # Navigate to the backend folder
    cd backend

    # Run the server
    node server.js
    ```
    > The Express (HTTP) server will start on port `5000` and the gRPC server on port `50051`.

2.  **Terminal 2: Start the Frontend React App**
    ```bash
    # Navigate to the frontend folder
    cd frontend

    # Run the React development server
    npm start
    ```
    > This will automatically open a new browser tab at `http://localhost:3000`.

3.  **Run the Benchmark:**
    -   Click the "Start Full Benchmark" button to execute all tests and populate the charts.
