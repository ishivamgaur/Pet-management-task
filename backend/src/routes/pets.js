const express = require("express");
const Pet = require("../models/Pet");
const { needLogin, needAdmin } = require("../middleware/auth");
const escapeRegex = require("../utils/escapeRegex");

const router = express.Router();

// GET /api/pets?search=&species=&breed=&minAge=&maxAge=&status=&page=&limit=
router.get("/", async (req, res) => {
  const { search, species, breed, minAge, maxAge, status } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  // Cap high enough that the admin desk can fetch the whole shelter in one
  // call. It used to clamp at 50, which silently truncated the admin list
  // while total still reported the true count.
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 9));

  const where = {};
  // Trim everything. A blank or whitespace-only query means "no filter",
  // not "match the literal space", otherwise a stray space returns zero
  // pets and looks like the shelter is empty.
  const term = (search || "").trim();
  const kind = (species || "").trim();
  const type = (breed || "").trim();

  if (kind) where.species = new RegExp(`^${escapeRegex(kind)}$`, "i");
  if (type) where.breed = new RegExp(escapeRegex(type), "i");
  if (status) where.status = status;
  if (minAge || maxAge) {
    where.age = {};
    if (minAge) where.age.$gte = Number(minAge);
    if (maxAge) where.age.$lte = Number(maxAge);
  }
  if (term) {
    // One shared pattern, so a single escape pass covers all three fields.
    const pattern = new RegExp(escapeRegex(term), "i");
    where.$or = [{ name: pattern }, { breed: pattern }, { species: pattern }];
  }

  const total = await Pet.countDocuments(where);
  const pets = await Pet.find(where)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ pets, page, pages: Math.ceil(total / limit) || 1, total });
});

// GET /api/pets/stats
// Counts and breed list for the filter UI. The listing page used to pull
// every pet just to derive these two aggregates, which meant downloading
// descriptions and photo URLs to render a dropdown and a row of chips.
// Declared before /:id so the literal path is not captured as an id.
router.get("/stats", async (req, res) => {
  const [total, bySpecies, breeds] = await Promise.all([
    Pet.countDocuments({}),
    Pet.aggregate([{ $group: { _id: "$species", count: { $sum: 1 } } }]),
    Pet.distinct("breed"),
  ]);

  const species = {};
  bySpecies.forEach((row) => {
    species[row._id] = row.count;
  });

  res.json({
    total,
    species,
    breeds: breeds.filter(Boolean).sort((a, b) => a.localeCompare(b)),
  });
});

// GET /api/pets/:id
router.get("/:id", async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) return res.status(404).json({ message: "Pet not found" });
  res.json(pet);
});

// POST /api/pets (admin)
router.post("/", needLogin, needAdmin, async (req, res) => {
  const { name, species, breed, age, gender, description, photoUrl, status } = req.body;
  if (!name || !species || age === undefined) {
    return res.status(400).json({ message: "Name, species and age are required" });
  }

  const pet = await Pet.create({
    name: name.trim(),
    species: species.trim().toLowerCase(),
    breed: (breed || "").trim(),
    age: Number(age),
    gender: gender || "unknown",
    description: description || "",
    photoUrl: (photoUrl || "").trim(),
    status: status || "available",
  });
  res.status(201).json(pet);
});

// PUT /api/pets/:id (admin)
router.put("/:id", needLogin, needAdmin, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) return res.status(404).json({ message: "Pet not found" });

  // Only overwrite fields the client actually sent, so a partial
  // edit cannot blank out the ones it left out.
  const fields = ["name", "species", "breed", "age", "gender", "description", "photoUrl", "status"];
  for (const field of fields) {
    if (req.body[field] !== undefined && req.body[field] !== "") pet[field] = req.body[field];
  }

  await pet.save();
  res.json(pet);
});

// DELETE /api/pets/:id (admin)
router.delete("/:id", needLogin, needAdmin, async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) return res.status(404).json({ message: "Pet not found" });
  await pet.deleteOne();
  res.json({ message: "Pet removed" });
});

module.exports = router;
