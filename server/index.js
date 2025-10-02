const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();
const PORT = 5000;
const SECRET = "mysecretkey"; // ⚠️ In production, use env variable

// ✅ Middleware: Parse JSON + Enable CORS
app.use(cors());
app.use(express.json());

// ✅ Middleware: Authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// ✅ Register new user
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ]);

    res.json({ message: "User registered successfully ✅" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ✅ Login user
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful ✅", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Profile (protected)
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ✅ Get workouts (protected)
app.get("/api/workouts", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM workouts WHERE user_id = ?", [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch workouts" });
  }
});

// ✅ Add workout (protected)
app.post("/api/workouts", authenticateToken, async (req, res) => {
  const { name, description, category, duration, date } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO workouts (name, description, category, duration, date, user_id) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, category, duration, date, req.user.id]
    );

    res.json({
      id: result.insertId,
      name,
      description,
      category,
      duration,
      date,
      user_id: req.user.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add workout" });
  }
});

// ✅ Delete workout (protected)
app.delete("/api/workouts/:id", authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM workouts WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Workout not found or not yours" });
    }

    res.json({ message: "Workout deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete workout" });
  }
});

// ✅ Update workout (protected)
app.put("/api/workouts/:id", authenticateToken, async (req, res) => {
  const { name, duration, date } = req.body;
  try {
    await db.query(
      "UPDATE workouts SET name = ?, duration = ?, date = ? WHERE id = ? AND user_id = ?",
      [name, duration, date, req.params.id, req.user.id]
    );
    res.json({ message: "Workout updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update workout" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
