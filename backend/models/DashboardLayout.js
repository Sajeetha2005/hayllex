const mongoose = require("mongoose")

const dashboardLayoutSchema = new mongoose.Schema({

    widgets: {
        type: Array,
        default: []
    },

    savedAt: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("DashboardLayout", dashboardLayoutSchema)
