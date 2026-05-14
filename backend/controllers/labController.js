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

// Create a lab
exports.createLab = async (req, res) => {
  try {
    const name = req.body.name?.trim() || req.body.lab_name?.trim();

    if (!name) {
      return res.status(400).json({ message: "Lab name is required" });
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
      },
    });
  } catch (err) {
    console.error("Create Lab Error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update a lab
exports.updateLab = async (req, res) => {
  try {
    const labId = req.params.id;
    const name = req.body.name?.trim() || req.body.lab_name?.trim();

    if (!name) {
      return res.status(400).json({ message: "Lab name is required" });
    }

    const [existing] = await db.query(
      `
      SELECT lab_id 
      FROM lab_details 
      WHERE LOWER(lab_name) = LOWER(?) AND lab_id != ?
      LIMIT 1
      `,
      [name, labId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Another lab with this name already exists" });
    }

    const [result] = await db.query(
      `
      UPDATE lab_details 
      SET lab_name = ?
      WHERE lab_id = ?
      `,
      [name, labId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lab not found" });
    }

    return res.json({ message: "Lab updated successfully", lab_id: labId, lab_name: name });
  } catch (err) {
    console.error("Update Lab Error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete a lab
exports.deleteLab = async (req, res) => {
  try {
    const labId = req.params.id;

    // Check if any assets belong to this lab
    const [assets] = await db.query(
      `
      SELECT asset_id FROM asset_details WHERE lab_id = ? LIMIT 1
      `,
      [labId]
    );

    if (assets.length > 0) {
      return res.status(400).json({ message: "Cannot delete lab. Assets are currently assigned to it." });
    }

    const [result] = await db.query(
      `
      DELETE FROM lab_details WHERE lab_id = ?
      `,
      [labId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lab not found" });
    }

    return res.json({ message: "Lab deleted successfully" });
  } catch (err) {
    console.error("Delete Lab Error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};
