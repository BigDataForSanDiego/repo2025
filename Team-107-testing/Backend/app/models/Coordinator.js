const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const coordinatorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        default: ""
    },
    contact: {
        type: String,
        default: "contact"
    }
});

// Hash password before saving
coordinatorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Coordinator = mongoose.model('Coordinator', coordinatorSchema);

module.exports = Coordinator;