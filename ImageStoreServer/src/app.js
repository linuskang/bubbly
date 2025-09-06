const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { logger } = require("./utils/winston");
const log = logger();

const dotenv = require("dotenv");
dotenv.config();
const env = process.env

const app = express();
const port = env.PORT || 3000;

function requireApiKey(req, res, next) {
  const userKey = req.headers["authorization"];
  if (userKey === `Bearer ${env.API_KEY}`) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
}

app.get("/", (req, res) => {
  res.json({ name: "Whisp CDN Server", version: "1.0.0", description: "CDN file hosting server for Whisp" });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    log.info(`req: ${ip} - ${req.method} ${req.url}`);
    next();
});
app.use(cors());
app.use("/images", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./app/uploads");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.post("/upload", requireApiKey, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  res.json({
    filename: req.file.filename,
    url: `/images/${req.file.filename}`,
  });
});

app.get("/images", (req, res) => {
  fs.readdir(path.join(__dirname, "uploads"), (err, files) => {
    if (err) return res.status(500).json({ error: "Failed to read images" });
    res.json(files);
  });
});

app.delete("/images/:filename", requireApiKey, (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json({ message: "Image deleted" });
  });
});

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((err, req, res, next) => {
    const ip =req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
    log.error(`err: ${ip}: ${err.message}`);
    res.status(500).send('Internal Server Error. Please try again later.');
});

app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(port, '0.0.0.0', () => {
  log.info(`Whisp CDN Server is running at http://0.0.0.0:${port}!`);
});