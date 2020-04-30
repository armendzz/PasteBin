var mongoose         = require("mongoose");

var pasteSchema = new mongoose.Schema({
    title: {type: String, default: "Untitled"},
    highlights: {type: String, select: true},
    content: String,
    status: {type: String, select: true},
    author: {
        id: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "User"
        },
        username: String
     },  
    expiration: {type: String, select: true},
    created: {type: Date, default: Date.now}
}, { strict: false });



var Paste = mongoose.model("Paste", pasteSchema);

module.exports = mongoose.model("Paste", pasteSchema);