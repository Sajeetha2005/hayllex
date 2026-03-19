const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({

    orderId: {
        type: String,
        unique: true
    },

    // Customer Information
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },

    // Order Information
    product: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    unitPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "In progress", "Completed"]
    },
    createdBy: { type: String, required: true },

    orderDate: {
        type: Date,
        default: Date.now
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

})

// Auto-generate orderId before save
orderSchema.pre("save", async function () {
    if (!this.orderId) {
        const count = await this.constructor.countDocuments()
        this.orderId = "ORD-" + String(count + 1).padStart(4, "0")
    }
})

module.exports = mongoose.model("Order", orderSchema)