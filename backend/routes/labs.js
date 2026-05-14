const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createLab, labDetails } = require("../controllers/labController");

const router = express();

router.get("/", authMiddleware, labDetails);
router.post("/", authMiddleware, createLab);

module.exports = router;
