const express = require("express");
const Application = require("../models/Application");
const Pet = require("../models/Pet");
const { needLogin, needAdmin } = require("../middleware/auth");
const { sendMail } = require("../services/mailer");
const { TEMPLATES } = require("../services/emailTemplates");

const router = express.Router();

const PHONE = /^[+]?[\d\s()-]{7,20}$/;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1000;

// Client validation is a convenience, not a guarantee, so the same rules
// live here. Anything the form checks, this also checks.
function validate({ message, phone }) {
  const text = (message || "").trim();

  if (!text) return "Tell the shelter a little about your home";
  if (text.length < MESSAGE_MIN) {
    return `Please write at least ${MESSAGE_MIN} characters about your home`;
  }
  if (text.length > MESSAGE_MAX) {
    return `Please keep it under ${MESSAGE_MAX} characters`;
  }

  const digits = (phone || "").trim();
  if (digits && !PHONE.test(digits)) return "That phone number does not look right";

  return null;
}

// POST /api/applications  (logged in user applies)
router.post("/", needLogin, async (req, res) => {
  const { petId, message, phone } = req.body;
  if (!petId) return res.status(400).json({ message: "petId is required" });

  const problem = validate({ message, phone });
  if (problem) return res.status(400).json({ message: problem });

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
    message: message.trim(),
    phone: (phone || "").trim(),
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

  const app = await Application.findById(req.params.id)
    .populate("pet")
    .populate("user", "name email");
  if (!app) return res.status(404).json({ message: "Application not found" });

  app.status = status;
  await app.save();

  const pet = await Pet.findById(app.pet._id || app.pet);

  // Everyone this decision affects, and what it means for them.
  const notices = [{ to: app.user?.email, status }];

  if (pet) {
    if (status === "approved") {
      pet.status = "adopted";
      await pet.save();

      // Everyone else waiting on this pet is out, and deserves to be told
      // rather than just watching the pet vanish from the list.
      const losers = await Application.find({ pet: pet._id, _id: { $ne: app._id }, status: "pending" })
        .populate("user", "name email")
        .select("user");
      if (losers.length) {
        await Application.updateMany(
          { _id: { $in: losers.map((l) => l._id) } },
          { status: "rejected" },
        );
        losers.forEach((l) => notices.push({ to: l.user?.email, status: "rejected" }));
      }
    } else {
      // Only reopen the pet if nobody else is still waiting.
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

  // Best effort. A mail provider being down must never undo a decision the
  // shelter has already made and returned.
  await notify({ notices, pet });

  res.json(app);
});

async function notify({ notices, pet }) {
  const url = `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`;
  const targets = notices.filter((n) => n.to);
  const ctx = { petName: pet?.name || "your pet", petPhoto: pet?.photoUrl, dashboardUrl: url };

  const results = await Promise.allSettled(
    targets.map((n) => sendMail({ to: n.to, ...TEMPLATES[n.status](ctx) })),
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length) {
    // Log the reason, not just the count, otherwise a misconfigured
    // provider is impossible to diagnose from the server output.
    failed.forEach((r) => console.error(`[mail] failed: ${r.reason.message}`));
  }
}

module.exports = router;
