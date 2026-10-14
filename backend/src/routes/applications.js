const express = require("express");
const Application = require("../models/Application");
const Pet = require("../models/Pet");
const { needLogin, needAdmin } = require("../middleware/auth");

const router = express.Router();

// POST /api/applications  (logged in user applies)
router.post("/", needLogin, async (req, res) => {
  const { petId, message, phone } = req.body;
  if (!petId) return res.status(400).json({ message: "petId is required" });

  const pet = await Pet.findById(petId);
  if (!pet) return res.status(404).json({ message: "Pet not found" });
  if (pet.status === "adopted") {
    return res.status(400).json({ message: "This pet is already adopted" });
  }

  const already = await Application.findOne({
    pet: petId,
    user: req.user._id,
    status: "pending",
  });
  if (already) {
    return res
      .status(400)
      .json({ message: "You already applied for this pet" });
  }

  const app = await Application.create({
    pet: petId,
    user: req.user._id,
    message: message || "",
    phone: phone || "",
  });

  // mark pet as pending so others know someone applied
  if (pet.status === "available") {
    pet.status = "pending";
    await pet.save();
  }

  res.status(201).json(app);
});

// GET /api/applications/mine (user's own)
router.get("/mine", needLogin, async (req, res) => {
  const apps = await Application.find({ user: req.user._id })
    .populate("pet")
    .sort({ createdAt: -1 });
  res.json(apps);
});

// GET /api/applications (admin, all)
router.get("/", needLogin, needAdmin, async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};
  const apps = await Application.find(where)
    .populate("pet")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(apps);
});

// PUT /api/applications/:id (admin approve / reject)
router.put("/:id", needLogin, needAdmin, async (req, res) => {
  const { status } = req.body; // approved | rejected
  if (!["approved", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ message: "Status must be approved or rejected" });
  }

  const app = await Application.findById(req.params.id).populate("pet");
  if (!app) return res.status(404).json({ message: "Application not found" });

  app.status = status;
  await app.save();

  const pet = await Pet.findById(app.pet._id || app.pet);
  if (pet) {
    if (status === "approved") {
      pet.status = "adopted";
      await pet.save();
      // reject other pending requests for same pet
      await Application.updateMany(
        { pet: pet._id, _id: { $ne: app._id }, status: "pending" },
        { status: "rejected" },
      );
    } else {
      // if no other pending apps left, set pet back to available
      const stillPending = await Application.countDocuments({
        pet: pet._id,
        status: "pending",
      });
      if (stillPending === 0 && pet.status !== "adopted") {
        pet.status = "available";
        await pet.save();
      }
    }
  }

  res.json(app);
});

module.exports = router;
