import React, { useState } from "react"

function FilterRow({ columns, onRemove, onUpdate, filter }) {
    const fieldOptions = columns.length > 0 ? columns : ["Status", "Product", "Created by"]
    return (
        <div className="filter-row">
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <select
                    className="form-control"
                    value={filter.field || ""}
                    onChange={e => onUpdate({ ...filter, field: e.target.value })}
                >
                    <option value="">Select field</option>
                    {fieldOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <select
                    className="form-control"
                    value={filter.operator || "equals"}
                    onChange={e => onUpdate({ ...filter, operator: e.target.value })}
                >
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="starts_with">Starts with</option>
                    <option value="greater_than">Greater than</option>
                    <option value="less_than">Less than</option>
                </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Value"
                    value={filter.value || ""}
                    onChange={e => onUpdate({ ...filter, value: e.target.value })}
                />
            </div>
            <button className="btn-icon danger" onClick={onRemove} title="Remove filter">✕</button>
        </div>
    )
}

function TableWidget({ config, data }) {
    const {
        title, description,
        columns: selectedColumns = [],
        sortBy,
        pagination: pageSize,
        applyFilter,
        fontSize,
        headerBackground
    } = config || {}

    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState([{ field: "", operator: "equals", value: "" }])

    const allData = data || []
    const colList = selectedColumns.length > 0 ? selectedColumns : [
        "Customer name", "Email id", "Product", "Status", "Total amount"
    ]

    const colFieldMap = {
        "Customer ID": "orderId",
        "Customer name": "firstName",
        "Email id": "email",
        "Phone number": "phone",
        "Address": "streetAddress",
        "Order ID": "orderId",
        "Order date": "orderDate",
        "Product": "product",
        "Quantity": "quantity",
        "Unit price": "unitPrice",
        "Total amount": "totalAmount",
        "Status": "status",
        "Created by": "createdBy"
    }

    const getVal = (row, col) => {
        const field = colFieldMap[col] || col
        const val = row[field]
        if (col === "Customer name") return `${row.firstName || ""} ${row.lastName || ""}`.trim()
        if (col === "Order date" && val) return new Date(val).toLocaleDateString()
        if (col === "Unit price" || col === "Total amount") return val ? `$${Number(val).toFixed(2)}` : "—"
        return val || "—"
    }

    // Apply filters
    let filtered = [...allData]
    if (applyFilter) {
        filters.forEach(f => {
            if (!f.field || !f.value) return
            const field = colFieldMap[f.field] || f.field
            filtered = filtered.filter(row => {
                const val = String(f.field === "Customer name"
                    ? `${row.firstName} ${row.lastName}`
                    : (row[field] || "")).toLowerCase()
                const fv = f.value.toLowerCase()
                if (f.operator === "equals") return val === fv
                if (f.operator === "contains") return val.includes(fv)
                if (f.operator === "starts_with") return val.startsWith(fv)
                if (f.operator === "greater_than") return Number(row[field]) > Number(f.value)
                if (f.operator === "less_than") return Number(row[field]) < Number(f.value)
                return true
            })
        })
    }

    // Sort
    if (sortBy === "Ascending") {
        filtered.sort((a, b) => String(a[Object.keys(a)[0]]).localeCompare(String(b[Object.keys(b)[0]])))
    } else if (sortBy === "Descending") {
        filtered.sort((a, b) => String(b[Object.keys(b)[0]]).localeCompare(String(a[Object.keys(a)[0]])))
    } else if (sortBy === "Order date") {
        filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    }

    // Pagination
    const ps = Number(pageSize) || 0
    const totalPages = ps ? Math.ceil(filtered.length / ps) : 1
    const paginatedData = ps ? filtered.slice((page - 1) * ps, page * ps) : filtered

    const tFontSize = Math.min(18, Math.max(12, Number(fontSize) || 14))
    const headerBg = headerBackground || "#54bd95"

    return (
        <div className="widget-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="widget-title">{title || "Table"}</span>
                {description && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{description}</span>}
            </div>

            {applyFilter && (
                <div className="filter-section" style={{ margin: "0 12px 0", borderRadius: 0, borderLeft: "none", borderRight: "none" }}>
                    {filters.map((f, idx) => (
                        <FilterRow
                            key={idx}
                            filter={f}
                            columns={colList}
                            onUpdate={updated => setFilters(prev => prev.map((x, i) => i === idx ? updated : x))}
                            onRemove={() => setFilters(prev => prev.filter((_, i) => i !== idx))}
                        />
                    ))}
                    <button
                        className="btn btn-secondary"
                        style={{ marginTop: 6, fontSize: "0.78rem", padding: "4px 10px" }}
                        onClick={() => setFilters(prev => [...prev, { field: "", operator: "equals", value: "" }])}
                    >
                        + Add filter
                    </button>
                </div>
            )}

            <div style={{ overflowX: "auto", flex: 1 }}>
                <table className="data-table" style={{ fontSize: tFontSize }}>
                    <thead>
                        <tr>
                            {colList.map(col => (
                                <th key={col} style={{ background: headerBg, color: "#fff", borderBottom: "none" }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={colList.length} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                                    No data
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, ri) => (
                                <tr key={row._id || ri}>
                                    {colList.map(col => (
                                        <td key={col}>{getVal(row, col)}</td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {ps > 0 && totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderTop: "1px solid var(--border)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <span>{filtered.length} records · Page {page} of {totalPages}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: "0.78rem" }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>←</button>
                        <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: "0.78rem" }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>→</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TableWidget
