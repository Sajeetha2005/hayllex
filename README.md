# Halleyx Dashboard

A comprehensive, full-stack dashboard application built with the MERN stack (MongoDB, Express.js, React, Node.js). This project features a customizable, drag-and-drop widget layout, interactive charts, and workflow management capabilities.

## 🚀 Deployment & Demo
- **Live Deployment Link**: [https://humorous-sparkle-production-9a02.up.railway.app/](https://humorous-sparkle-production-9a02.up.railway.app/)
- **Video Demo**: [Watch Demo Video](./demo.mp4)

## ✨ Features
- **Interactive Dashboard**: Customizable interface using `react-grid-layout` with draggable widgets.
- **Data Visualization**: Rich charts and graphs powered by `recharts`.
- **Workflow Management**: Visual node-based workflow builder utilizing `reactflow`.
- **Responsive UI**: Clean, animated components built with `framer-motion` and styled alongside `lucide-react` icons.
- **RESTful API**: Robust backend serving dashboard data, order management, and workflow processing.
- **Containerized**: Fully containerized using Docker and Docker Compose for easy deployment and setup.

## 🛠️ Technology Stack
### Frontend
- React 18
- React Router DOM
- Framer Motion (Animations)
- React Grid Layout (Dashboard Layouts)
- ReactFlow (Workflows)
- Recharts (Data Visualization)
- Axios

### Backend
- Node.js & Express.js
- MongoDB & Mongoose (Database & ORM)
- Docker & Docker Compose

## ⚙️ Local Setup & Installation

Follow these steps to run the application locally.

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB
- Docker (optional, but recommended for easy setup)

### Option 1: Using Docker (Recommended)
You can easily spin up the entire application (frontend, backend, and database) using Docker Compose.

1. Ensure Docker is installed and running.
2. Clone the repository and navigate to the project root.
3. Run the following command:
   ```bash
   docker-compose up --build
   ```
4. Access the application:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

### Option 2: Manual Setup

#### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure MongoDB is running on `localhost:27017` or configure your `MONGO_URI`.
4. Start the server:
   ```bash
   npm start
   ```

#### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

## 📂 Project Structure
```
Halleyx-Dashboard/
├── backend/              # Node.js/Express.js Server
│   ├── config/           # Environment & Database Configuration
│   ├── controllers/      # Route controllers (API logic)
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── services/         # Business logic & background services
│   ├── package.json
│   └── server.js         # Entry point for backend
├── frontend/             # React Application
│   ├── public/           # Static assets
│   ├── src/              # React components, pages, and logic
│   └── package.json
└── docker-compose.yml    # Docker container configuration
```

## 📝 License
This project is licensed under the ISC License.
