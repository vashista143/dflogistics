const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      enum: [
        "Fuel",
        "Parking",
        "Toll",
        "Maintenance",
        "Food",
        "Other",
      ],
      required: true,
    },


    description: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
    },

    expenseDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Expense",
  expenseSchema
);