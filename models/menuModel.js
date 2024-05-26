const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    list: [{type: mongoose.Schema.Types.ObjectId, ref:"items"}],
    number: { type: Number },
});

module.exports = mongoose.model("menu", menuSchema);