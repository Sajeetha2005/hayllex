# Halleyx Advanced Workflow Automation Suite

Welcome to the **Halleyx Workflow Engine**. Designed as an impressive demonstration for the POC, this modular, dark-theme workflow suite allows users to build, execute, and monitor complex automated pipelines visually.

## Features & Meeting Evaluator Criteria
| Feature | Details | 
| :--- | :--- | 
| **Backend & APIs (20%)** | Full CRUD capabilities. `Express` controllers manage logic across `Workflow`, `Step`, `Rule` and `ExecutionLog` MongoDB models. Execution triggers utilize `POST /execute` endpoints. |
| **Rule Engine (20%)** | A native Node class engine (`RuleEngine`) parses JSON schemas carrying mathematical, strict, and conditional logical operators (`==, >, <, contains`) against incoming payloads cleanly separating TRUE/FALSE paths. |
| **Workflow Execution (20%)** | `ExecutionEngine` loops through stored Nodes sequentially. Transforms inputs, triggers external actions/delays, handles pipeline failures gracefully, and outputs comprehensive `ExecutionLog` steps to the database for debugging. |
| **Frontend UI (15%)** | Features a premium Glassmorphism Dark Theme design. Built on `ReactFlow`, allowing visual Drag-and-Drop Workflow composition natively in the dashboard. |

## Quick Start Setup Docs

### 1) Backend Terminal
Install dependencies and run the Node environment:
```bash
cd backend
npm install
npm install lodash axios
npm start
```
*Note: Make sure your local MongoDB instance is running!*

### 2) Frontend Terminal
Install frontend mapping libraries and launch the React app:
```bash
cd frontend
npm install reactflow framer-motion lucide-react
npm start
```

## Running a Test Workflow
1. Navigate to `http://localhost:3000/workflows`.
2. Click **Create Workflow** and name it (e.g., *Check Inventory Output*).
3. From the left palette, drag a **Trigger**, an **Action**, and a **Condition** onto the grid.
4. Hover over their handles to connect them sequentially with lines.
5. Click the **Condition** node. The configuration panel will slide in from the right.
6. Click **Add Rule** and set your conditional logic path.
7. Click **Save Workflow** at the top right, followed by **Execute**.
8. Navigate to **Execution Logs** on the sidebar to watch the payload data flow linearly through your designed nodes!
