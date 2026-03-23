import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import OrdersPage from "./pages/OrdersPage"
import DashboardConfigPage from "./pages/DashboardConfigPage"
import WorkflowDashboard from "./pages/WorkflowDashboard"
import WorkflowEditor from "./pages/WorkflowEditor"
import ExecutionLogs from "./pages/ExecutionLogs"
import CustomersPage from "./pages/CustomersPage"
import SettingsPage from "./pages/SettingsPage"
import Sidebar from "./components/Sidebar"
import TopBar from "./components/TopBar"

function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">
                <Sidebar />
                <div className="main-container">
                    <TopBar />
                    <div className="page-content">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/customers" element={<CustomersPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/configure" element={<DashboardConfigPage />} />
                            <Route path="/workflows" element={<WorkflowDashboard />} />
                            <Route path="/workflows/logs" element={<ExecutionLogs />} />
                            <Route path="/workflows/:id" element={<WorkflowEditor />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </BrowserRouter>
    )
}

export default App
