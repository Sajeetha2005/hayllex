const Order = require("../models/Orders")
const DashboardLayout = require("../models/DashboardLayout")

// Save dashboard layout
exports.saveLayout = async (req, res) => {
    try {
        await DashboardLayout.deleteMany({})
        const layout = new DashboardLayout({ widgets: req.body.widgets })
        await layout.save()
        res.json(layout)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// Get dashboard layout
exports.getLayout = async (req, res) => {
    try {
        const layout = await DashboardLayout.findOne().sort({ savedAt: -1 })
        res.json(layout || { widgets: [] })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// Seed a default dashboard layout with all chart types
exports.seedDefaultLayout = async (req, res) => {
    try {
        const widgets = [
            {
                id: "widget-kpi-1", type: "kpi", label: "KPI Card",
                config: { title: "Total Orders", metric: "Customer ID", aggregation: "Count", dataFormat: "Number", decimalPrecision: 0, width: 3, height: 2 },
                layout: { x: 0, y: 0, w: 3, h: 2 }
            },
            {
                id: "widget-kpi-2", type: "kpi", label: "KPI Card",
                config: { title: "Total Revenue", metric: "Total amount", aggregation: "Sum", dataFormat: "Currency", decimalPrecision: 2, width: 3, height: 2 },
                layout: { x: 3, y: 0, w: 3, h: 2 }
            },
            {
                id: "widget-kpi-3", type: "kpi", label: "KPI Card",
                config: { title: "Avg Order Value", metric: "Total amount", aggregation: "Average", dataFormat: "Currency", decimalPrecision: 2, width: 3, height: 2 },
                layout: { x: 6, y: 0, w: 3, h: 2 }
            },
            {
                id: "widget-kpi-4", type: "kpi", label: "KPI Card",
                config: { title: "Total Quantity", metric: "Quantity", aggregation: "Sum", dataFormat: "Number", decimalPrecision: 0, width: 3, height: 2 },
                layout: { x: 9, y: 0, w: 3, h: 2 }
            },
            {
                id: "widget-bar-1", type: "bar", label: "Bar Chart",
                config: { title: "Revenue by Product", xAxis: "Product", yAxis: "Total amount", chartColor: "#54bd95", showDataLabel: false, width: 6, height: 5 },
                layout: { x: 0, y: 2, w: 6, h: 5 }
            },
            {
                id: "widget-line-1", type: "line", label: "Line Chart",
                config: { title: "Quantity by Product", xAxis: "Product", yAxis: "Quantity", chartColor: "#4a9ede", showDataLabel: false, width: 6, height: 5 },
                layout: { x: 6, y: 2, w: 6, h: 5 }
            },
            {
                id: "widget-area-1", type: "area", label: "Area Chart",
                config: { title: "Unit Price by Product", xAxis: "Product", yAxis: "Unit price", chartColor: "#9b59b6", showDataLabel: false, width: 6, height: 5 },
                layout: { x: 0, y: 7, w: 6, h: 5 }
            },
            {
                id: "widget-pie-1", type: "pie", label: "Pie Chart",
                config: { title: "Orders by Product", chartData: "Product", showLegend: true, width: 4, height: 5 },
                layout: { x: 6, y: 7, w: 4, h: 5 }
            },
            {
                id: "widget-pie-2", type: "pie", label: "Pie Chart",
                config: { title: "Orders by Status", chartData: "Status", showLegend: true, width: 4, height: 5 },
                layout: { x: 10, y: 7, w: 2, h: 5 }
            }
        ]
        await DashboardLayout.deleteMany({})
        const layout = new DashboardLayout({ widgets })
        await layout.save()
        res.json(layout)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}


// KPI aggregation: Sum, Average, Count on a numeric field
exports.getAggregation = async (req, res) => {
    try {
        const { metric, aggregation, startDate, endDate } = req.query

        let filter = {}
        if (startDate && endDate) {
            filter.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) }
        }

        const fieldMap = {
            "Customer ID": "_id",
            "Customer name": "firstName",
            "Email id": "email",
            "Address": "streetAddress",
            "Order date": "orderDate",
            "Product": "product",
            "Created by": "createdBy",
            "Status": "status",
            "Total amount": "totalAmount",
            "Unit price": "unitPrice",
            "Quantity": "quantity"
        }

        const dbField = fieldMap[metric] || metric
        const numericFields = ["totalAmount", "unitPrice", "quantity"]

        let result = 0

        if (aggregation === "Count") {
            result = await Order.countDocuments(filter)
        } else if (aggregation === "Sum" && numericFields.includes(dbField)) {
            const agg = await Order.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: `$${dbField}` } } }
            ])
            result = agg[0] ? agg[0].total : 0
        } else if (aggregation === "Average" && numericFields.includes(dbField)) {
            const agg = await Order.aggregate([
                { $match: filter },
                { $group: { _id: null, avg: { $avg: `$${dbField}` } } }
            ])
            result = agg[0] ? agg[0].avg : 0
        } else {
            result = await Order.countDocuments(filter)
        }

        res.json({ value: result })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// Chart data: group by a field and aggregate another
exports.getChartData = async (req, res) => {
    try {
        const { xField, yField, startDate, endDate, chartData } = req.query

        let filter = {}
        if (startDate && endDate) {
            filter.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) }
        }

        const fieldMap = {
            "Product": "product",
            "Quantity": "quantity",
            "Unit price": "unitPrice",
            "Total amount": "totalAmount",
            "Status": "status",
            "Created by": "createdBy",
            "Duration": "orderDate"
        }

        const numericFields = ["quantity", "unitPrice", "totalAmount"]

        // For pie charts (single dimension)
        if (chartData) {
            const groupField = fieldMap[chartData] || "product"
            const data = await Order.aggregate([
                { $match: filter },
                { $group: { _id: `$${groupField}`, value: { $sum: 1 } } },
                { $project: { name: "$_id", value: 1, _id: 0 } }
            ])
            return res.json(data)
        }

        const xDbField = fieldMap[xField] || "product"
        const yDbField = fieldMap[yField] || "totalAmount"

        let pipeline = [{ $match: filter }]

        if (numericFields.includes(yDbField)) {
            pipeline.push(
                { $group: { _id: `$${xDbField}`, value: { $sum: `$${yDbField}` } } },
                { $project: { name: "$_id", [yField]: "$value", _id: 0 } },
                { $sort: { name: 1 } }
            )
        } else {
            pipeline.push(
                { $group: { _id: { x: `$${xDbField}`, y: `$${yDbField}` }, count: { $sum: 1 } } },
                { $project: { name: "$_id.x", [yField]: "$_id.y", count: 1, _id: 0 } },
                { $sort: { name: 1 } }
            )
        }

        const data = await Order.aggregate(pipeline)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
