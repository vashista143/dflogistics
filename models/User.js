const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    profileImage: {
    type: String,
    default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    appleId: {
    type: String,
    unique: true,
    sparse: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 8,
    },

    mobileNumber: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    // GeoJSON Location
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [0, 0],
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },

    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "expired"],
      default: "inactive",
    },

    subscriptionStart: Date,

    subscriptionEnd: Date,

    paymentId: String,

    orderId: String,

    amountPaid: Number,

    refreshToken: {
      type: String,
      default: null,
    },
    gender: {
  type: String,
  enum: ["Male", "Female", "Other"],
  default: null,
},

dateOfBirth: {
  type: Date,
},

country: {
  type: String,
  default: "",
},

state: {
  type: String,
  default: "",
},

city: {
  type: String,
  default: "",
},

zipCode: {
  type: String,
  default: "",
},

homeAddress: {
  type: String,
  default: "",
},

drivingexp: {
  type: String,
  default: "",
},

trucktype: {
  type: String,
  default: "",
},

notificationSettings: {
  type: Boolean,
  default: true,
},

theme: {
  type: String,
  enum: ["light", "dark"],
  default: "light",
},
  },
  {
    timestamps: true,
  }
);

userSchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
