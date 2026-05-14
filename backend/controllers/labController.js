const db = require("../db/db");

// All Lab Details
exports.labDetails = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        lab.lab_id,
        lab.lab_name,
        faculty.faculty_id,
        faculty.faculty_name,
        faculty.faculty_contact,
        faculty.faculty_email,
        faculty.start_date,
        faculty.end_date
      FROM lab_details lab
      LEFT JOIN faculty_details faculty
        ON lab.lab_incharge_faculty_id = faculty.faculty_id;
    `);

    res.json({ labs: rows });
  } catch (err) {
    console.error("Lab Details Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a lab that can be used immediately by asset forms
exports.createLab = async (req, res) => {
  try {
    const name = req.body.name?.trim() || req.body.lab_name?.trim();
    const building = req.body.building?.trim() || req.body.block?.trim() || "";
    const metadata = req.body.metadata?.trim() || "";
    const capacityValue = Number(req.body.capacity);
    const capacity = Number.isFinite(capacityValue) && capacityValue > 0 ? capacityValue : null;

    if (!name || !building) {
      return res.status(400).json({ message: "Lab name and block/building are required" });
    }

    const [existing] = await db.query(
      `
      SELECT lab_id, lab_name
      FROM lab_details
      WHERE LOWER(lab_name) = LOWER(?)
      LIMIT 1
      `,
      [name]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Lab already exists",
        lab: existing[0],
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO lab_details (lab_name, lab_incharge_faculty_id)
      VALUES (?, NULL)
      `,
      [name]
    );

    return res.status(201).json({
      lab: {
        lab_id: result.insertId,
        lab_name: name,
        building,
        block: building,
        capacity,
        metadata,
      },
    });
  } catch (err) {
    console.error("Create Lab Error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
