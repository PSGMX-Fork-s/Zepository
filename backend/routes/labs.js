const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { createLab, labDetails, updateLab, deleteLab } = require("../controllers/labController");

const router = express();

router.get("/", authMiddleware, labDetails);
router.post("/", authMiddleware, createLab);
router.put("/:id", authMiddleware, updateLab);
router.delete("/:id", authMiddleware, deleteLab);

module.exports = router;
