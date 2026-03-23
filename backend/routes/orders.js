const express = require("express")
const router = express.Router()

const controller = require("../controllers/orderController")

router.post("/", controller.createOrder)
router.get("/", controller.getOrders)
router.get("/unit-prices", controller.getUnitPrices)
router.get("/customers", controller.getCustomers)
router.put("/:id", controller.updateOrder)
router.delete("/:id", controller.deleteOrder)

module.exports = router