import React, { useEffect, useState } from "react"
import axios from "axios"
import OrderForm from "../components/OrderForm"
import OrdersTable from "../components/OrdersTable"

const API = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders`

function Toast({ message, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3000)
        return () => clearTimeout(t)
    }, [onClose])

    return (
        <div className={`toast ${type}`}>
            <span>{type === "success" ? "✅" : "❌"}</span>
            <span>{message}</span>
        </div>
    )
}

function OrdersPage() {
    const [orders, setOrders] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editOrder, setEditOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState(null)

    const showToast = (message, type = "success") => {
        setToast({ message, type })
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const res = await axios.get(API)
            setOrders(res.data)
        } catch {
            showToast("Failed to fetch orders", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (formData) => {
        try {
            if (editOrder) {
                await axios.put(`${API}/${editOrder._id}`, formData)
                showToast("Order updated successfully")
            } else {
                await axios.post(API, formData)
                showToast("Order created successfully")
            }
            setShowForm(false)
            setEditOrder(null)
            fetchOrders()
        } catch (err) {
            showToast(err.response?.data?.error || "Failed to save order", "error")
        }
    }

    const handleEdit = (order) => {
        setEditOrder(order)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API}/${id}`)
            showToast("Order deleted")
            fetchOrders()
        } catch {
            showToast("Failed to delete order", "error")
        }
    }

    const handleCloseForm = () => {
        setShowForm(false)
        setEditOrder(null)
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-title-group">
                    <h1>Customer Orders</h1>
                    <p>Manage and track all customer orders</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        + Create Order
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            {orders.length > 0 && (
                <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                    {[
                        { label: "Total Orders", value: orders.length, icon: "📦" },
                        { label: "Pending", value: orders.filter(o => o.status === "Pending").length, icon: "⏳" },
                        { label: "In Progress", value: orders.filter(o => o.status === "In progress").length, icon: "🔄" },
                        { label: "Completed", value: orders.filter(o => o.status === "Completed").length, icon: "✅" },
                        {
                            label: "Total Revenue",
                            value: "$" + orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0).toFixed(2),
                            icon: "💰"
                        }
                    ].map(stat => (
                        <div key={stat.label} className="card" style={{ flex: "1 1 150px", minWidth: 140 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: "1.5rem" }}>{stat.icon}</span>
                                <div>
                                    <div style={{ fontSize: "1.35rem", fontWeight: 700 }}>{stat.value}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: "center", padding: "80px", color: "var(--text-muted)" }}>
                    Loading orders...
                </div>
            ) : (
                <OrdersTable
                    orders={orders}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {showForm && (
                <OrderForm
                    onClose={handleCloseForm}
                    onSave={handleSave}
                    initialData={editOrder}
                />
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    )
}

export default OrdersPage