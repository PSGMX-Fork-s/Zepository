const db = require("../db/db");

// STATS FOR DASHBOARD
exports.stats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
    at.type_name,
    SUM(CASE WHEN LOWER(ad.working_status) = 'working' THEN 1 ELSE 0 END) AS working,
    SUM(CASE WHEN LOWER(ad.working_status) = 'defective' THEN 1 ELSE 0 END) AS defective,
    SUM(CASE WHEN LOWER(ad.working_status) = 'under_service' THEN 1 ELSE 0 END) AS under_service
    FROM asset_types at
    LEFT JOIN asset_details ad 
    ON ad.asset_type_id = at.type_id
    AND COALESCE(ad.is_deleted, 0) != 1
    GROUP BY at.type_name;
    `);

    res.json({ stats: rows });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL ASSETS
exports.getAllAssets = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        ad.asset_id,
        ad.serial_no,
		    at.type_name,
        ad.brand,
        ad.model,
        ad.working_status,
        ld.lab_name
      FROM asset_details ad
      LEFT JOIN asset_types at
        ON ad.asset_type_id = at.type_id
      LEFT JOIN lab_details ld ON ad.lab_id = ld.lab_id  
      WHERE COALESCE(ad.is_deleted, 0) != 1 AND ad.working_status != "obsolete"
      ORDER BY ad.asset_id DESC;
    `
    );

    return res.json({ assets: rows });
  } catch (err) {
    console.error("Error fetching assets:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ASSET BY ID
exports.getAssetById = async (req, res) => {
  try {
    const id = req.params.id;

    // ==============================
    // 1) MAIN ASSET DETAILS
    // ==============================
    const [rows] = await db.query(
      `
      SELECT 
        ad.asset_id,
        ad.serial_no,
        ad.asset_type_id,
        at.type_name,
        ad.brand,
        ad.model,
        ad.working_status,
        
        lab.lab_name,
        
        ad.purchase_date,
        ad.funding_agency,  
        ad.price,
        ad.updated_at,
        
        ud.user_name,
        
        wd.warranty_id,
        wd.warranty_startdate,
        wd.warranty_enddate,
        wd.vendor_name,
        wd.vendor_contact,
        
        ledger.ledger_id,
        ledger.page_no, 
        ledger.serial_no AS ledger_serial_no

      FROM asset_details ad

      LEFT JOIN asset_types at 
        ON ad.asset_type_id = at.type_id

      LEFT JOIN lab_details lab 
        ON ad.lab_id = lab.lab_id

      LEFT JOIN warranty_details wd 
        ON ad.asset_id = wd.asset_id 

      LEFT JOIN user_details ud 
        ON ud.user_id = ad.created_by

      LEFT JOIN ledger_details ledger 
        ON ad.asset_id = ledger.asset_id

      WHERE ad.asset_id = ?
        AND COALESCE(ad.is_deleted, 0) != 1
      LIMIT 1;
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Asset not found" });
    }

    const asset = rows[0];

    // ==============================
    // 2) SPECIFICATIONS
    // ==============================
    const [specRows] = await db.query(
      `
      SELECT 
        spec_key,
        spec_value,
        unit
      FROM asset_specs
      WHERE asset_id = ?
      `,
      [id]
    );

    asset.specs = specRows; // [] if none

    // ==============================
    // 3) SERVICE HISTORY (NEW)
    // ==============================
    const [serviceRows] = await db.query(
      `
      SELECT
        sr.service_id,
        sr.sent_date,
        sr.service_note,
        sr.after_note,
        sr.service_cost,
        sr.service_status,
        sr.service_provider,
        sr.service_through,
        sr.warranty_claim,
        sr.created_at,
        sr.updated_at,

        ud.user_name AS requested_by_name

      FROM service_requests sr
      LEFT JOIN user_details ud
        ON sr.requested_by = ud.user_id

      WHERE sr.asset_id = ?
      ORDER BY sr.created_at DESC
      `,
      [id]
    );

    asset.services = serviceRows; // [] if no service history

    // ==============================
    // 4) SEND COMBINED RESPONSE
    // ==============================
    return res.json({ asset });

  } catch (err) {
    console.error("Error fetching asset details:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getAssetTypes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT type_id, type_name 
      FROM asset_types 
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No asset types found" });
    }

    return res.json({ types: rows });
  } catch (err) {
    console.error("Error fetching asset types:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addAsset = async (req, res) => {
  const connection = await db.getConnection(); // transaction connection

  try {
    await connection.beginTransaction();

    const {
      type_id,
      brand,
      model,
      serial_no,
      working_status,
      lab_id,
      purchase_date,
      funding_agency,
      price,
      warranty,
      ledger,
      specs,
    } = req.body;

    const userId = req.user.id; // from JWT middleware
    const fix = (v) => (v === "" ? null : v);

    // ===============================
    // 1) INSERT ASSET
    // ===============================
    const [assetResult] = await connection.query(
      `
      INSERT INTO asset_details 
      (asset_type_id, brand, model, serial_no, working_status, lab_id,purchase_date, funding_agency, price, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        fix(type_id),
        fix(brand),
        fix(model),
        fix(serial_no),
        fix(working_status),
        fix(lab_id),
        fix(purchase_date),
        fix(funding_agency),
        fix(price),
        userId,
      ]
    );

    const assetId = assetResult.insertId;

    // ===============================
    // 2) INSERT LEDGER (OPTIONAL)
    // ===============================
    if (ledger) {
      await connection.query(
        `
        INSERT INTO ledger_details (asset_id, serial_no, page_no, created_by)
        VALUES (?, ?, ?, ?)
        `,
        [
          assetId,
          fix(ledger.ledger_serial_no),
          fix(ledger.page_no),
          userId,
        ]
      );
    }

    // ===============================
    // 3) INSERT WARRANTY (OPTIONAL)
    // ===============================
    if (warranty) {
      await connection.query(
        `
        INSERT INTO warranty_details 
        (asset_id, vendor_name, vendor_contact, warranty_startdate, warranty_enddate, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          assetId,
          fix(warranty.vendor_name),
          fix(warranty.vendor_contact),
          fix(warranty.warranty_startdate),
          fix(warranty.warranty_enddate),
          userId,
        ]
      );
    }

    // ===============================
    // 4) INSERT MULTIPLE SPECS (OPTIONAL)
    // ===============================
    if (Array.isArray(specs) && specs.length > 0) {
      for (const s of specs) {
        if (!s.spec_key && !s.spec_value) continue; // ignore empty rows

        await connection.query(
          `
          INSERT INTO asset_specs (asset_id, spec_key, spec_value, unit, created_by)
          VALUES (?, ?, ?, ?, ?)
          `,
          [assetId, fix(s.spec_key), fix(s.spec_value), fix(s.unit), userId]
        );
      }
    }

    // ===============================
    // 5) COMMIT TRANSACTION
    // ===============================
    await connection.commit();
    connection.release();

    res.json({
      message: "Asset added successfully",
      asset_id: assetId,
    });
  } catch (err) {
    await connection.rollback();
    connection.release();

    console.error("Add Asset Error:", err.sqlMessage);
    res.status(500).json({ message: "Server error", error: err.sqlMessage });
  }
};

// PUT /api/assets/:id
exports.updateAsset = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const assetId = req.params.id;
    const userId = req.user.id;

    const { basic, ledger, warranty, specs } = req.body;

    const fix = (v) => (v === "" ? null : v);

    /* -------------------------
       BASIC INFO UPDATE
    --------------------------*/
    if (basic) {
      const fields = [];
      const params = [];

      const allowed = [
        "asset_type_id",
        "brand",
        "model",
        "serial_no",
        "working_status",
        "lab_id",
        "purchase_date",
        "funding_agency",
        "price",
      ];

      for (const k of allowed) {
        if (basic[k] !== undefined) {
          fields.push(`${k} = ?`);
          params.push(fix(basic[k]));
        }
      }

      if (fields.length > 0) {
        params.push(assetId);

        await connection.query(
          `UPDATE asset_details SET ${fields.join(
            ", "
          )}, updated_at = CURRENT_TIMESTAMP WHERE asset_id = ?`,
          params
        );
      }
    }

    /* -------------------------
       LEDGER UPSERT
    --------------------------*/
    if (ledger !== undefined) {
      if (!ledger) {
        await connection.query(
          `DELETE FROM ledger_details WHERE asset_id = ?`,
          [assetId]
        );
      } else if (ledger.ledger_id) {
        await connection.query(
          `UPDATE ledger_details 
           SET serial_no = ?, page_no = ?
           WHERE ledger_id = ? AND asset_id = ?`,
          [
            fix(ledger.ledger_serial_no),
            fix(ledger.page_no),
            ledger.ledger_id,
            assetId,
          ]
        );
      } else {
        await connection.query(
          `INSERT INTO ledger_details (asset_id, serial_no, page_no, created_by) 
           VALUES (?, ?, ?, ?)`,
          [
            assetId,
            fix(ledger.ledger_serial_no),
            fix(ledger.page_no),
            userId,
          ]
        );
      }
    }

    /* -------------------------
       WARRANTY UPSERT
    --------------------------*/
    if (warranty !== undefined) {
      if (!warranty) {
        await connection.query(
          `DELETE FROM warranty_details WHERE asset_id = ?`,
          [assetId]
        );
      } else if (warranty.warranty_id) {
        await connection.query(
          `UPDATE warranty_details
           SET vendor_name = ?, vendor_contact = ?, warranty_startdate = ?, 
               warranty_enddate = ?, updated_at = CURRENT_TIMESTAMP
           WHERE warranty_id = ? AND asset_id = ?`,
          [
            fix(warranty.vendor_name),
            fix(warranty.vendor_contact),
            fix(warranty.warranty_startdate),
            fix(warranty.warranty_enddate),
            warranty.warranty_id,
            assetId,
          ]
        );
      } else {
        await connection.query(
          `INSERT INTO warranty_details 
           (asset_id, vendor_name, vendor_contact, warranty_startdate, warranty_enddate, created_by) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            assetId,
            fix(warranty.vendor_name),
            fix(warranty.vendor_contact),
            fix(warranty.warranty_startdate),
            fix(warranty.warranty_enddate),
            userId,
          ]
        );
      }
    }

    /* -------------------------
       SPECIFICATIONS REPLACE
    --------------------------*/
    if (specs !== undefined) {
      await connection.query(
        `DELETE FROM asset_specs WHERE asset_id = ?`,
        [assetId]
      );

      if (specs.length > 0) {
        const sql = `INSERT INTO asset_specs 
          (asset_id, spec_key, spec_value, unit, created_by)
          VALUES (?, ?, ?, ?, ?)`;

        for (const s of specs) {
          if (!s.spec_key && !s.spec_value) continue;

          await connection.query(sql, [
            assetId,
            s.spec_key,
            s.spec_value,
            fix(s.unit),
            userId,
          ]);
        }
      }
    }

    await connection.commit();
    connection.release();
    return res.json({ message: "Asset updated successfully" });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error("Update error:", err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};




