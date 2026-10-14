const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    species: { type: String, required: true, trim: true }, // dog, cat, rabbit...
    breed: { type: String, default: "", trim: true },
    age: { type: Number, required: true, min: 0 }, // in years
    gender: {
      type: String,
      enum: ["male", "female", "unknown"],
      default: "unknown",
    },
    description: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["available", "pending", "adopted"],
      default: "available",
    },
  },
  { timestamps: true },
);

petSchema.index({ name: "text", breed: "text", species: "text" });

module.exports = mongoose.model("Pet", petSchema);
