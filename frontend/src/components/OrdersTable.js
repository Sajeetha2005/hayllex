import React, { useState, useRef, useEffect } from "react"

function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="confirm-dialog">
                <div className="confirm-dialog-icon">🗑️</div>
                <h3>Delete Order</h3>
                <p>{message || "Are you sure you want to delete this order? This action cannot be undone."}</p>
                <div className="confirm-dialog-actions">
                    <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status }) {
    const cls = status === "Pending" ? "badge-pending"
        : status === "In progress" ? "badge-inprogress"
            : "badge-completed"
    return <span className={`badge ${cls}`}>{status}</span>
}

function OrdersTable({ orders, onEdit, onDelete }) {
    const [menuOpen, setMenuOpen] = useState(null)
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
    const [confirmId, setConfirmId] = useState(null)
    const menuRef = useRef(null)

    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(null)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const openMenu = (e, id) => {
        e.preventDefault()
        const rect = e.currentTarget.getBoundingClientRect()
        setMenuPos({ x: rect.right, y: rect.bottom })
        setMenuOpen(id)
    }

    const handleDelete = (id) => {
        setMenuOpen(null)
        setConfirmId(id)
    }

    const handleConfirmDelete = () => {
        onDelete(confirmId)
        setConfirmId(null)
    }

    if (orders.length === 0) {
        return (
            <div className="data-table-wrapper">
                <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    <h3>No Orders Yet</h3>
                    <p>Click "Create Order" to add your first customer order.</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="data-table-wrapper">
                <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>City</th>
                                <th>Country</th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Created By</th>
                                <th>Order Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td style={{ fontFamily: "monospace", color: "var(--accent)", fontSize: "0.8rem" }}>{order.orderId}</td>
                                    <td>{order.firstName} {order.lastName}</td>
                                    <td style={{ color: "var(--text-secondary)" }}>{order.email}</td>
                                    <td style={{ color: "var(--text-secondary)" }}>{order.phone}</td>
                                    <td>{order.city}</td>
                                    <td>{order.country}</td>
                                    <td>{order.product}</td>
                                    <td>{order.quantity}</td>
                                    <td>${Number(order.unitPrice).toFixed(2)}</td>
                                    <td style={{ fontWeight: 600 }}>${Number(order.totalAmount).toFixed(2)}</td>
                                    <td><StatusBadge status={order.status} /></td>
                                    <td style={{ color: "var(--text-secondary)" }}>{order.createdBy}</td>
                                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "—"}
                                    </td>
                                    <td style={{ position: "relative", textAlign: "right" }}>
                                        <button
                                            className="btn-icon"
                                            onClick={e => openMenu(e, order._id)}
                                            title="Options"
                                        >
                                            ⋮
                                        </button>
                                        {menuOpen === order._id && (
                                            <div
                                                ref={menuRef}
                                                className="context-menu"
                                                style={{ position: "fixed", top: menuPos.y, left: menuPos.x - 150 }}
                                            >
                                                <div className="context-menu-item" onClick={() => { onEdit(order); setMenuOpen(null) }}>
                                                    ✏️ Edit
                                                </div>
                                                <div className="context-menu-item danger" onClick={() => handleDelete(order._id)}>
                                                    🗑️ Delete
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {confirmId && (
                <ConfirmDialog
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmId(null)}
                />
            )}
        </>
    )
}

export default OrdersTable
