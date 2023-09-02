const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
    id: {
        type: Number,
        default: 1
    },
    title: String,
    content: String
});
  
module.exports = mongoose.model('Journal', journalSchema);