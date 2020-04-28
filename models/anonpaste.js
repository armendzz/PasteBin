var mongoose         = require("mongoose");

var anonPasteSchema = new mongoose.Schema({
    title: String,
    highlights: {type: String, select: true},
    content: String,
    status: {type: String, select: true},
    expiration: {type: String, select: true},
    created: {type: Date, default: Date.now}
});

var AnonPaste = mongoose.model("AnonPaste", anonPasteSchema);

module.exports = mongoose.model("AnonPaste", anonPasteSchema);