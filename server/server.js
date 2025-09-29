const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/calculate", (req, res) => {
  const { total, attended, requiredPercent } = req.body;

  if (!total || !attended || !requiredPercent) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const currentPercent = (attended / total) * 100;
  const canMiss = Math.floor((attended * 100 / requiredPercent) - total);

  res.json({
    currentPercent: currentPercent.toFixed(2),
    canMiss: canMiss >= 0 ? canMiss : 0
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
