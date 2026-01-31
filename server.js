import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: true }
);

const gameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Game = mongoose.model("Game", gameSchema);

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return res.status(401).json({ error: "No token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    if (String(password).length < 6) return res.status(400).json({ error: "password too short" });

    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ error: "email already used" });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({ email: String(email).toLowerCase(), passwordHash });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, user: { email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ error: "server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ error: "server error" });
  }
});

app.get("/api/games", async (req, res) => {
  const games = await Game.find().sort({ createdAt: -1 });
  res.json(games);
});

app.post("/api/games", auth, requireAdmin, async (req, res) => {
  try {
    const { title, price, image, description } = req.body || {};
    if (!title || price === undefined) return res.status(400).json({ error: "title and price required" });

    const game = await Game.create({
      title: String(title),
      price: Number(price),
      image: image ? String(image) : "",
      description: description ? String(description) : "",
      createdBy: req.user.id
    });

    res.status(201).json(game);
  } catch {
    res.status(500).json({ error: "server error" });
  }
});

app.delete("/api/games/:id", auth, requireAdmin, async (req, res) => {
  const deleted = await Game.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: "not found" });
  res.json({ ok: true });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");

  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
