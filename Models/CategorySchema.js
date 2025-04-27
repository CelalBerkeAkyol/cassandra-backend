const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Kategori adı zorunludur"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, "Kategori slug'ı zorunludur"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Kategori açıklaması zorunludur"],
      trim: true,
      maxlength: 250,
    },
    icon: {
      type: String,
      default: "mdi:tag",
    },
    color: {
      type: String,
      default: "bg-slate-600",
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
