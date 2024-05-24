const mongoose = require("mongoose");
const { string } = require("prop-types");

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ingredients: [{ type: String }],
    techniques : [{ type: String }],
    garnish : [{ type: String }],
});

itemSchema.index({ name:"text",ingredients : "text"});

module.exports = mongoose.model("items", itemSchema);
