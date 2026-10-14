const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Pet = require("../models/Pet");
const { needLogin, needAdmin } = require("../middleware/auth");

const router = express.Router();

// simple local upload (optional, photoUrl works too)
const uploadDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// GET /api/pets?search=&species=&breed=&minAge=&maxAge=&status=&page=&limit=
router.get("/", async (req, res) => {
  const { search, species, breed, minAge, maxAge, status } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9));

  const where = {};
  if (species) where.species = new RegExp(`^${species}$`, "i");
  if (breed) where.breed = new RegExp(breed, "i");
  if (status) where.status = status;
  if (minAge || maxAge) {
    where.age = {};
    if (minAge) where.age.$gte = Number(minAge);
    if (maxAge) where.age.$lte = Number(maxAge);
  }
  if (search) {
    where.$or = [
      { name: new RegExp(search, "i") },
      { breed: new RegExp(search, "i") },
      { species: new RegExp(search, "i") },
    ];
  }

  const total = await Pet.countDocuments(where);
  const pets = await Pet.find(where)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ pets, page, pages: Math.ceil(total / limit) || 1, total });
});

// GET /api/pets/:id
router.get("/:id", async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) return res.status(404).json({ message: "Pet not found" });
  res.json(pet);
});

// POST /api/pets (admin)
router.post(
  "/",
  needLogin,
  needAdmin,
  upload.single("photo"),
  async (req, res) => {
    const { name, species, breed, age, gender, description, photoUrl, status } =
      req.body;
    if (!name || !species || age === undefined) {
      return res
        .status(400)
        .json({ message: "Name, species and age are required" });
    }

    let photo = photoUrl || "";
    if (req.file) photo = `/uploads/${req.file.filename}`;

    const pet = await Pet.create({
      name: name.trim(),
      species: species.trim().toLowerCase(),
      breed: (breed || "").trim(),
      age: Number(age),
      gender: gender || "unknown",
      description: description || "",
      photoUrl: photo,
      status: status || "available",
    });
    res.status(201).json(pet);
  },
);

// PUT /api/pets/:id (admin)
router.put(
  "/:id",
  needLogin,
  needAdmin,
  upload.single("photo"),
  async (req, res) => {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const fields = [
      "name",
      "species",
      "breed",
      "age",
      "gender",
      "description",
      "photoUrl",
      "status",
    ];
    for (const f of fields) {
      if (req.body[f] !== undefined && req.body[f] !== "") pet[f] = req.body[f];
    }
    if (req.file) pet.photoUrl = `/uploads/${req.file.filename}`;
    await pet.save();
    res.json(pet);
  },
);

// DELETE /api/pets/:id (admin)
router.delete("/:id", needLogin, needAdmin, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) return res.status(404).json({ message: "Pet not found" });
  await pet.deleteOne();
  res.json({ message: "Pet removed" });
});

module.exports = router;
