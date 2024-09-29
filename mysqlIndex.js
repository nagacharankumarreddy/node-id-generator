require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
});

async function initDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ids (
      full_id VARCHAR(255) NOT NULL
    )
  `);
}

initDatabase();

app.post("/generate-id", async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const date = new Date();
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;
    const sequencePrefix = `${String(currentYear).slice(-2)}${String(
      currentMonth
    ).padStart(2, "0")}`;

    const [existingIds] = await connection.query(
      "SELECT full_id FROM ids ORDER BY full_id DESC LIMIT 1"
    );

    let sequenceNumber = 1;
    if (existingIds.length > 0) {
      const lastGeneratedId = existingIds[0].full_id;
      const lastIdMonth = parseInt(lastGeneratedId.slice(2, 4), 10);
      const lastIdYear = 2000 + parseInt(lastGeneratedId.slice(0, 2), 10);
      const lastSeqNumber = parseInt(lastGeneratedId.slice(4), 10);

      if (lastIdMonth === currentMonth && lastIdYear === currentYear) {
        sequenceNumber = lastSeqNumber + 1;
      }
    }

    const newId = `${sequencePrefix}${String(sequenceNumber).padStart(6, "0")}`;

    await connection.query("INSERT INTO ids (full_id) VALUES (?)", [newId]);

    await connection.commit();
    return res.json({ requestId: newId });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: "Server Error" });
  } finally {
    connection.release();
  }
});

app.get("/current-id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT full_id FROM ids ORDER BY full_id DESC LIMIT 1"
    );
    return res.json(
      rows.length > 0 ? { full_id: rows[0].full_id } : { full_id: null }
    );
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
