const Order = require("../models/Orders")

// Unit prices map
const UNIT_PRICES = {
    "Fiber Internet 300 Mbps": 49.99,
    "5G Unlimited Mobile Plan": 39.99,
    "Fiber Internet 1 Gbps": 89.99,
    "Business Internet 500 Mbps": 129.99,
    "VoIP Corporate Package": 199.99
}

exports.createOrder = async (req, res) => {
    try {
        const order = new Order(req.body)
        await order.save()
        res.status(201).json(order)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

exports.getOrders = async (req, res) => {
    try {
        const { startDate, endDate } = req.query
        let filter = {}
        if (startDate && endDate) {
            filter.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
        const orders = await Order.find(filter).sort({ orderDate: -1 })
        res.json(orders)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.json(order)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

exports.deleteOrder = async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id)
        res.json({ message: "Order deleted" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

exports.getUnitPrices = async (req, res) => {
    res.json(UNIT_PRICES)
}

exports.getCustomers = async (req, res) => {
    try {
        const customers = await Order.aggregate([
            {
                $group: {
                    _id: "$email",
                    firstName: { $first: "$firstName" },
                    lastName: { $first: "$lastName" },
                    email: { $first: "$email" },
                    phone: { $first: "$phone" },
                    city: { $first: "$city" },
                    state: { $first: "$state" },
                    country: { $first: "$country" },
                    totalOrders: { $sum: 1 },
                    totalSpend: { $sum: "$totalAmount" },
                    lastOrderDate: { $max: "$orderDate" }
                }
            },
            {
                $project: {
                    _id: 0,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    phone: 1,
                    city: 1,
                    state: 1,
                    country: 1,
                    totalOrders: 1,
                    totalSpend: 1,
                    lastOrderDate: 1
                }
            },
            { $sort: { lastOrderDate: -1 } }
        ])
        res.json(customers)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}