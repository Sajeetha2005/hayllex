import React, { useState, useEffect } from "react"
import axios from "axios"

function CustomersPage() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [sortField, setSortField] = useState("lastOrderDate")
    const [sortDir, setSortDir] = useState("desc")

    useEffect(() => {
        fetchCustomers()
    }, [])

    const fetchCustomers = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/customers`)
            setCustomers(res.data)
        } catch (e) {
            console.error("Failed to load customers:", e)
        } finally {
            setLoading(false)
        }
    }

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDir("asc")
        }
    }

    const filtered = customers
        .filter(c => {
            const q = search.toLowerCase()
            return (
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.city || "").toLowerCase().includes(q) ||
                (c.country || "").toLowerCase().includes(q)
            )
        })
        .sort((a, b) => {
            let av = a[sortField], bv = b[sortField]
            if (sortField === "lastOrderDate") { av = new Date(av); bv = new Date(bv) }
            if (av < bv) return sortDir === "asc" ? -1 : 1
            if (av > bv) return sortDir === "asc" ? 1 : -1
            return 0
        })

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>↕</span>
        return <span style={{ color: "var(--accent)", marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
    }

    const totalRevenue = customers.reduce((s, c) => s + (c.totalSpend || 0), 0)
    const totalOrders  = customers.reduce((s, c) => s + (c.totalOrders || 0), 0)

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div className="page-title-group">
                    <h1>Customers</h1>
                    <p>All unique customers derived from orders</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
                <div className="widget-card" style={{ padding: "18px 22px" }}>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Customers</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>{customers.length}</div>
                </div>
                <div className="widget-card" style={{ padding: "18px 22px" }}>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Orders</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>{totalOrders.toLocaleString()}</div>
                </div>
                <div className="widget-card" style={{ padding: "18px 22px" }}>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Revenue</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>
                        ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="widget-card" style={{ padding: "18px 22px" }}>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg. Spend</div>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>
                        ${customers.length ? (totalRevenue / customers.length).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.9rem" }}>🔍</span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name, email, city..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 32 }}
                    />
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Table */}
            <div className="widget-card" style={{ padding: 0, overflow: "hidden" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                        <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
                        Loading customers...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state" style={{ padding: "60px" }}>
                        <div className="empty-state-icon">👥</div>
                        <h3>{search ? "No customers match your search" : "No Customers Yet"}</h3>
                        <p>{search ? "Try a different search term." : "Customers will appear here once orders are created."}</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                    {[
                                        { label: "Customer", field: "firstName" },
                                        { label: "Email", field: "email" },
                                        { label: "Phone", field: "phone" },
                                        { label: "Location", field: "city" },
                                        { label: "Orders", field: "totalOrders" },
                                        { label: "Total Spend", field: "totalSpend" },
                                        { label: "Last Order", field: "lastOrderDate" },
                                    ].map(col => (
                                        <th
                                            key={col.field}
                                            onClick={() => handleSort(col.field)}
                                            style={{
                                                padding: "12px 16px",
                                                textAlign: "left",
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                color: "var(--text-muted)",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                cursor: "pointer",
                                                whiteSpace: "nowrap",
                                                userSelect: "none",
                                                background: "var(--bg-card)"
                                            }}
                                        >
                                            {col.label}<SortIcon field={col.field} />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c, i) => (
                                    <tr
                                        key={c.email}
                                        style={{
                                            borderBottom: "1px solid var(--border)",
                                            background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                                            transition: "background 0.15s"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover, rgba(84,189,149,0.05))"}
                                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"}
                                    >
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: "50%",
                                                    background: "var(--accent)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: "0.8rem", fontWeight: 700, color: "#fff",
                                                    flexShrink: 0
                                                }}>
                                                    {c.firstName?.[0]}{c.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                                                        {c.firstName} {c.lastName}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{c.email}</td>
                                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>{c.phone}</td>
                                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                            {[c.city, c.state, c.country].filter(Boolean).join(", ")}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span style={{
                                                display: "inline-block",
                                                padding: "2px 10px",
                                                borderRadius: 12,
                                                fontSize: "0.78rem",
                                                fontWeight: 600,
                                                background: "rgba(84,189,149,0.12)",
                                                color: "var(--accent)"
                                            }}>
                                                {c.totalOrders}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                                            ${(c.totalSpend || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                                            {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CustomersPage
