require("dotenv").config();
const express = require("express");
const Redis = require("ioredis");

const app = express();
app.use(express.json());

const redis = new Redis({
  host: "localhost",
  port: 6379,
});

app.post("/generate-id", async (req, res) => {
  const date = new Date();
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth() + 1;
  const sequencePrefix = `${String(currentYear).slice(-2)}${String(
    currentMonth
  ).padStart(2, "0")}`;

  const key = `id-sequence:${currentYear}:${currentMonth}`;
  const sequenceNumber = await redis.incr(key);

  const newId = `${sequencePrefix}${String(sequenceNumber).padStart(6, "0")}`;

  await redis.set(`last-id`, newId);
  return res.json({ requestId: newId });
});

app.get("/current-id", async (req, res) => {
  const lastId = await redis.get("last-id");
  return res.json(lastId ? { full_id: lastId } : { full_id: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
