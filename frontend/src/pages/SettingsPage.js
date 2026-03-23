import React, { useState } from "react"

function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general")
    const [settings, setSettings] = useState({
        // General Settings
        companyName: "Halleyx Workflow Suite",
        companyEmail: "admin@halleyx.com",
        timezone: "UTC",
        language: "English",
        autoSave: true,
        notifications: true,
        
        // Theme Settings
        theme: "dark",
        accentColor: "#007bff",
        sidebarCollapsed: false,
        animationsEnabled: true,
        
        // Order Settings
        defaultOrderStatus: "Pending",
        autoCalculateTotals: true,
        emailNotifications: true,
        orderConfirmation: true,
        
        // Dashboard Settings
        refreshInterval: "30",
        showKPIBadges: true,
        enableAnimations: true,
        compactMode: false
    })

    const updateSetting = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const saveSettings = () => {
        // Save to localStorage
        localStorage.setItem("app-settings", JSON.stringify(settings))
        alert("Settings saved successfully!")
    }

    const resetSettings = () => {
        if (confirm("Are you sure you want to reset all settings to default?")) {
            localStorage.removeItem("app-settings")
            window.location.reload()
        }
    }

    const GeneralSettings = () => (
        <div className="settings-section">
            <div className="settings-section-title">Company Information</div>
            <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                    type="text"
                    className="form-control"
                    value={settings.companyName}
                    onChange={e => updateSetting("general", "companyName", e.target.value)}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Company Email</label>
                <input
                    type="email"
                    className="form-control"
                    value={settings.companyEmail}
                    onChange={e => updateSetting("general", "companyEmail", e.target.value)}
                />
            </div>
            
            <div className="settings-section-title" style={{ marginTop: "24px" }}>Preferences</div>
            <div className="form-group">
                <label className="form-label">Timezone</label>
                <select
                    className="form-control"
                    value={settings.timezone}
                    onChange={e => updateSetting("general", "timezone", e.target.value)}
                >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="GMT">GMT</option>
                    <option value="IST">India Standard Time</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Language</label>
                <select
                    className="form-control"
                    value={settings.language}
                    onChange={e => updateSetting("general", "language", e.target.value)}
                >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                </select>
            </div>
            
            <div className="settings-section-title" style={{ marginTop: "24px" }}>Features</div>
            <div className="form-group">
                <label className="form-check">
                    <input
                        type="checkbox"
                        checked={settings.autoSave}
                        onChange={e => updateSetting("general", "autoSave", e.target.checked)}
                    />
                    Enable Auto-Save
                </label>
            </div>
            <div className="form-group">
                <label className="form-check">
                    <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={e => updateSetting("general", "notifications", e.target.checked)}
                    />
                    Enable Notifications
                </label>
            </div>
        </div>
    )

    const ThemeSettings = () => (
        <div className="settings-section">
            <div className="settings-section-title">Appearance</div>
            <div className="form-group">
                <label className="form-label">Theme</label>
                <select
                    className="form-control"
                    value={settings.theme}
                    onChange={e => updateSetting("theme", "theme", e.target.value)}
                >
                    <option value="dark">Dark (Default)</option>
                    <option value="light">Light</option>
                    <option value="blue">Blue Theme</option>
                    <option value="purple">Purple Theme</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Accent Color</label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                        type="color"
                        value={settings.accentColor}
                        onChange={e => updateSetting("theme", "accentColor", e.target.value)}
                        style={{ width: "50px", height: "36px", border: "none", borderRadius: "6px" }}
                    />
                    <input
                        type="text"
                        className="form-control"
                        value={settings.accentColor}
                        onChange={e => updateSetting("theme", "accentColor", e.target.value)}
                        style={{ flex: 1, fontFamily: "monospace" }}
                    />
                </div>
            </div>
            
            <div className="settings-section-title" style={{ marginTop: "24px" }}>Interface</div>
            <div className="form-group">
                <label className="form-check">
                    <input
                        type="checkbox"
                        checked={settings.sidebarCollapsed}
                        onChange={e => updateSetting("theme", "sidebarCollapsed", e.target.checked)}
                    />
                    Collapse Sidebar by Default
                </label>
            </div>
            <div className="form-group">
                <label className="form-check">
                    <input
                        type="checkbox"
                        checked={settings.animationsEnabled}
                        onChange={e => updateSetting("theme", "animationsEnabled", e.target.checked)}
                    />
                    Enable Animations
                </label>
            </div>
        </div>
    )

    const OrderSettings = () => (
        <div className="settings-section">
            <div className="settings-section-title">Order Configuration</div>
            <div className="form-group">
                <label className="form-label">Default Order Status</label>
                <select
                    className="form-control"
                    value={settings.defaultOrderStatus}
                    onChange={e => updateSetting("order", "defaultOrderStatus", e.target.value)}
                >
                    <option value="Pending">Pending</option>
                    <option value="In progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>
            
            <div className="settings-section-title" style={{ marginTop: "24px" }}>Automation</div>
            <div className="form-group">
                <label className="form-check">
                    <input
                        type="checkbox"
                        checked={settings.autoCalculateTotals}
                        onChange={e => updateSetting("order", "autoCalculateTotals", e.target.checked)}
                    />
                    Auto-Calculate Totals
                </label>
            </div>
            <div className="form-group">
                <label className="form-check">
                    <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={e => updateSetting("order", "emailNotifications", e.target.checked)}
                    />
                    Send Email Notifications
                </label>
            </div>
            <div className="form-group">
                <label className="form-check">
                    <input
                        type="checkbox"
                        checked={settings.orderConfirmation}
                        onChange={e => updateSetting("order", "orderConfirmation", e.target.checked)}
                    />
                    Require Order Confirmation
                </label>
            </div>
        </div>
    )

    const DashboardSettings = () => (
        <div className="settings-section">
            <div className="settings-section-title">Dashboard Configuration</div>
            <div className="form-group">
                <label className="form-label">Auto Refresh Interval (seconds)</label>
                <select
                    className="form-control"
                    value={settings.refreshInterval}
                    onChange={e => updateSetting("dashboard", "refreshInterval", e.target.value)}
                >
                    <option value="0">Disabled</option>
                    <option value="15">15 seconds</option>
                    <option value="30">30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                </select>
            </div>
            
            <div className="settings-section-title" style={{ marginTop: "24px" }}>Display Options</div>
            <div className="form-group">
                <label className="form-check">
                    <input
                        type="checkbox"
                        checked={settings.showKPIBadges}
                        onChange={e => updateSetting("dashboard", "showKPIBadges", e.target.checked)}
                    />
                    Show KPI Badges
                </label>
            </div>
            <div className="form-group">
                <label className="form-check">
                    <input
                        type="checkbox"
                        checked={settings.enableAnimations}
                        onChange={e => updateSetting("dashboard", "enableAnimations", e.target.checked)}
                    />
                    Enable Dashboard Animations
                </label>
            </div>
            <div className="form-group">
                <label className="form-check">
                    <input
                        type="checkbox"
                        checked={settings.compactMode}
                        onChange={e => updateSetting("dashboard", "compactMode", e.target.checked)}
                    />
                    Compact Mode
                </label>
            </div>
        </div>
    )

    const tabs = [
        { id: "general", label: "General", icon: "⚙️" },
        { id: "theme", label: "Theme", icon: "🎨" },
        { id: "order", label: "Orders", icon: "📋" },
        { id: "dashboard", label: "Dashboard", icon: "📊" }
    ]

    const renderTabContent = () => {
        switch (activeTab) {
            case "general": return <GeneralSettings />
            case "theme": return <ThemeSettings />
            case "order": return <OrderSettings />
            case "dashboard": return <DashboardSettings />
            default: return <GeneralSettings />
        }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div className="page-title-group">
                    <h1>Settings</h1>
                    <p>Configure your application preferences and settings</p>
                </div>
            </div>

            <div style={{ display: "flex", gap: "24px", height: "calc(100vh - 200px)" }}>
                {/* Sidebar Navigation */}
                <div style={{ width: "250px", flexShrink: 0 }}>
                    <div className="card">
                        <div style={{ padding: "8px" }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`settings-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        border: "none",
                                        background: activeTab === tab.id ? "var(--accent)" : "transparent",
                                        color: activeTab === tab.id ? "#fff" : "var(--text-primary)",
                                        borderRadius: "8px",
                                        textAlign: "left",
                                        cursor: "pointer",
                                        marginBottom: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        transition: "var(--transition)"
                                    }}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, overflowY: "auto" }}>
                    <div className="card">
                        <div style={{ padding: "24px" }}>
                            {renderTabContent()}
                            
                            {/* Action Buttons */}
                            <div style={{ 
                                display: "flex", 
                                gap: "12px", 
                                marginTop: "32px", 
                                paddingTop: "24px", 
                                borderTop: `1px solid var(--border)` 
                            }}>
                                <button className="btn btn-primary" onClick={saveSettings}>
                                    💾 Save Changes
                                </button>
                                <button className="btn btn-secondary" onClick={resetSettings}>
                                    🔄 Reset to Default
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage
