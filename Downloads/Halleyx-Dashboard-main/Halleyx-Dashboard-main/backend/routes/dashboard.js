const express = require("express")
const router = express.Router()

const controller = require("../controllers/dashboardController")

router.post("/layout", controller.saveLayout)
router.post("/seed-default", controller.seedDefaultLayout)
router.get("/layout", controller.getLayout)
router.get("/aggregate", controller.getAggregation)
router.get("/chartdata", controller.getChartData)

module.exports = router

