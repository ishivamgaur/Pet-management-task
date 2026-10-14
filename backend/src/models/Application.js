const mongoose = require("mongoose");

const appSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, default: "" },
    phone: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// one pending request per user per pet
appSchema.index({ pet: 1, user: 1 });

module.exports = mongoose.model("Application", appSchema);
