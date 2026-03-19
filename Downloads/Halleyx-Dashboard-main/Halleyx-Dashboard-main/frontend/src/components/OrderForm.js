import React, { useState, useEffect } from "react"

const PRODUCTS = [
    "Fiber Internet 300 Mbps",
    "5G Unlimited Mobile Plan",
    "Fiber Internet 1 Gbps",
    "Business Internet 500 Mbps",
    "VoIP Corporate Package"
]

const UNIT_PRICES = {
    "Fiber Internet 300 Mbps": 49.99,
    "5G Unlimited Mobile Plan": 39.99,
    "Fiber Internet 1 Gbps": 89.99,
    "Business Internet 500 Mbps": 129.99,
    "VoIP Corporate Package": 199.99
}

const COUNTRIES = ["United States", "Canada", "Australia", "Singapore", "Hong Kong"]

const CREATORS = [
    "Mr. Michael Harris",
    "Mr. Ryan Cooper",
    "Ms. Olivia Carter",
    "Mr. Lucas Martin"
]

const QUICK_FILL_TEMPLATES = [
    {
        name: "Corporate Client",
        template: {
            firstName: "John",
            lastName: "Smith",
            email: "john.smith@corporate.com",
            phone: "+1-555-0100",
            streetAddress: "123 Business Ave",
            city: "New York",
            state: "NY",
            postalCode: "10001",
            country: "United States",
            product: "Business Internet 500 Mbps",
            quantity: 5,
            status: "Pending",
            createdBy: "Mr. Michael Harris"
        }
    },
    {
        name: "Residential Customer",
        template: {
            firstName: "Jane",
            lastName: "Doe",
            email: "jane.doe@email.com",
            phone: "+1-555-0200",
            streetAddress: "456 Residential St",
            city: "Los Angeles",
            state: "CA",
            postalCode: "90001",
            country: "United States",
            product: "Fiber Internet 1 Gbps",
            quantity: 1,
            status: "Pending",
            createdBy: "Ms. Olivia Carter"
        }
    },
    {
        name: "Mobile Plan User",
        template: {
            firstName: "Mike",
            lastName: "Johnson",
            email: "mike.j@email.com",
            phone: "+1-555-0300",
            streetAddress: "789 Mobile Way",
            city: "Chicago",
            state: "IL",
            postalCode: "60007",
            country: "United States",
            product: "5G Unlimited Mobile Plan",
            quantity: 3,
            status: "Pending",
            createdBy: "Mr. Ryan Cooper"
        }
    }
]

const INITIAL_FORM = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    product: "",
    quantity: 1,
    unitPrice: "",
    totalAmount: "",
    status: "Pending",
    createdBy: ""
}

const REQUIRED_FIELDS = [
    "firstName", "lastName", "email", "phone",
    "streetAddress", "city", "state", "postalCode", "country",
    "product", "quantity", "unitPrice", "status", "createdBy"
]

function OrderForm({ onClose, onSave, initialData }) {
    const [form, setForm] = useState(INITIAL_FORM)
    const [errors, setErrors] = useState({})
    const [showQuickFill, setShowQuickFill] = useState(false)

    useEffect(() => {
        if (initialData) {
            setForm({ ...INITIAL_FORM, ...initialData })
        } else {
            setForm(INITIAL_FORM)
        }
    }, [initialData])

    const handleChange = (field, value) => {
        setErrors(prev => prev[field] ? { ...prev, [field]: "" } : prev)
        setForm(prev => {
            const updated = { ...prev, [field]: value }

            if (field === "product") {
                const price = UNIT_PRICES[value] || ""
                updated.unitPrice = price
                updated.totalAmount = price ? (Number(updated.quantity) * price).toFixed(2) : ""
            }

            if (field === "quantity") {
                const qty = Math.max(1, Number(value))
                updated.quantity = qty
                if (updated.unitPrice) {
                    updated.totalAmount = (qty * Number(updated.unitPrice)).toFixed(2)
                }
            }

            return updated
        })
    }

    const validate = () => {
        const newErrors = {}
        REQUIRED_FIELDS.forEach(field => {
            const val = form[field]
            if (val === "" || val === null || val === undefined) {
                newErrors[field] = "Please fill the field"
            }
        })
        return newErrors
    }

    const handleQuickFill = (template) => {
        const filledData = { ...template }
        const price = UNIT_PRICES[filledData.product] || ""
        filledData.unitPrice = price
        filledData.totalAmount = price ? (Number(filledData.quantity) * price).toFixed(2) : ""
        setForm(filledData)
        setShowQuickFill(false)
        setErrors({})
    }

    const handleSubmit = () => {
        const newErrors = validate()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }
        onSave(form)
    }

    const err = (name) => errors[name] ? (
        <span className="form-error">{errors[name]}</span>
    ) : null

    const inputCls = (name) => `form-control${errors[name] ? " error" : ""}`

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <h3>{initialData ? "Edit Order" : "Create Order"}</h3>
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => setShowQuickFill(!showQuickFill)}
                            style={{ fontSize: "0.8rem", padding: "6px 12px" }}
                        >
                            ⚡ Quick Fill
                        </button>
                    </div>
                    <button className="btn-icon" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Quick Fill Templates */}
                    {showQuickFill && (
                        <div className="quick-fill-section">
                            <div className="quick-fill-grid">
                                {QUICK_FILL_TEMPLATES.map((tmpl, idx) => (
                                    <button
                                        key={idx}
                                        className="quick-fill-card"
                                        onClick={() => handleQuickFill(tmpl.template)}
                                    >
                                        <div className="quick-fill-icon">⚡</div>
                                        <div className="quick-fill-name">{tmpl.name}</div>
                                        <div className="quick-fill-product">{tmpl.template.product}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Customer Information ── */}
                    <div className="settings-section-title" style={{ marginBottom: 14 }}>
                        Customer Information
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>

                        {/* First name */}
                        <div className="form-group">
                            <label className="form-label">First name <span className="required">*</span></label>
                            <input
                                type="text"
                                className={inputCls("firstName")}
                                value={form.firstName}
                                onChange={e => handleChange("firstName", e.target.value)}
                            />
                            {err("firstName")}
                        </div>

                        {/* Last name */}
                        <div className="form-group">
                            <label className="form-label">Last name <span className="required">*</span></label>
                            <input
                                type="text"
                                className={inputCls("lastName")}
                                value={form.lastName}
                                onChange={e => handleChange("lastName", e.target.value)}
                            />
                            {err("lastName")}
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email ID <span className="required">*</span></label>
                            <input
                                type="email"
                                className={inputCls("email")}
                                value={form.email}
                                onChange={e => handleChange("email", e.target.value)}
                            />
                            {err("email")}
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                            <label className="form-label">Phone number <span className="required">*</span></label>
                            <input
                                type="text"
                                className={inputCls("phone")}
                                value={form.phone}
                                onChange={e => handleChange("phone", e.target.value)}
                            />
                            {err("phone")}
                        </div>

                        {/* Street Address — full width */}
                        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                            <label className="form-label">Street Address <span className="required">*</span></label>
                            <input
                                type="text"
                                className={inputCls("streetAddress")}
                                value={form.streetAddress}
                                onChange={e => handleChange("streetAddress", e.target.value)}
                            />
                            {err("streetAddress")}
                        </div>

                        {/* City */}
                        <div className="form-group">
                            <label className="form-label">City <span className="required">*</span></label>
                            <input
                                type="text"
                                className={inputCls("city")}
                                value={form.city}
                                onChange={e => handleChange("city", e.target.value)}
                            />
                            {err("city")}
                        </div>

                        {/* State */}
                        <div className="form-group">
                            <label className="form-label">State / Province <span className="required">*</span></label>
                            <input
                                type="text"
                                className={inputCls("state")}
                                value={form.state}
                                onChange={e => handleChange("state", e.target.value)}
                            />
                            {err("state")}
                        </div>

                        {/* Postal code */}
                        <div className="form-group">
                            <label className="form-label">Postal code <span className="required">*</span></label>
                            <input
                                type="text"
                                className={inputCls("postalCode")}
                                value={form.postalCode}
                                onChange={e => handleChange("postalCode", e.target.value)}
                            />
                            {err("postalCode")}
                        </div>

                        {/* Country */}
                        <div className="form-group">
                            <label className="form-label">Country <span className="required">*</span></label>
                            <select
                                className={inputCls("country")}
                                value={form.country}
                                onChange={e => handleChange("country", e.target.value)}
                            >
                                <option value="">Select country</option>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {err("country")}
                        </div>
                    </div>

                    {/* ── Order Information ── */}
                    <div className="settings-section-title" style={{ marginBottom: 14, marginTop: 8 }}>
                        Order Information
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>

                        {/* Product — full width */}
                        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                            <label className="form-label">Choose product <span className="required">*</span></label>
                            <select
                                className={inputCls("product")}
                                value={form.product}
                                onChange={e => handleChange("product", e.target.value)}
                            >
                                <option value="">Select product</option>
                                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            {err("product")}
                        </div>

                        {/* Quantity */}
                        <div className="form-group">
                            <label className="form-label">Quantity <span className="required">*</span></label>
                            <input
                                type="number"
                                className={inputCls("quantity")}
                                value={form.quantity}
                                min={1}
                                onChange={e => handleChange("quantity", e.target.value)}
                            />
                            {err("quantity")}
                        </div>

                        {/* Unit price */}
                        <div className="form-group">
                            <label className="form-label">Unit price <span className="required">*</span></label>
                            <div style={{ position: "relative" }}>
                                <span style={{
                                    position: "absolute", left: 12, top: "50%",
                                    transform: "translateY(-50%)", color: "var(--text-secondary)"
                                }}>$</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ paddingLeft: 28 }}
                                    value={form.unitPrice}
                                    readOnly
                                />
                            </div>
                            {err("unitPrice")}
                        </div>

                        {/* Total amount — full width */}
                        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                            <label className="form-label">Total amount</label>
                            <div style={{ position: "relative" }}>
                                <span style={{
                                    position: "absolute", left: 12, top: "50%",
                                    transform: "translateY(-50%)", color: "var(--text-secondary)"
                                }}>$</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    style={{ paddingLeft: 28 }}
                                    value={form.totalAmount}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="form-group">
                            <label className="form-label">Status <span className="required">*</span></label>
                            <select
                                className={inputCls("status")}
                                value={form.status}
                                onChange={e => handleChange("status", e.target.value)}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In progress">In progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            {err("status")}
                        </div>

                        {/* Created by */}
                        <div className="form-group">
                            <label className="form-label">Created by <span className="required">*</span></label>
                            <select
                                className={inputCls("createdBy")}
                                value={form.createdBy}
                                onChange={e => handleChange("createdBy", e.target.value)}
                            >
                                <option value="">Select creator</option>
                                {CREATORS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {err("createdBy")}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        {initialData ? "Update" : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OrderForm
