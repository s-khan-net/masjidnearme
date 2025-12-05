const mongoose = require('mongoose');

const hitsSchema = new mongoose.Schema({
    hitLocation: {
        type: { type: String },
        coordinates: []
    },
    hitOn: { type: Date },
    ip: { type: String },
    searchRadius: { type: Number }
});

hitsSchema.index({ hitLocation: "2dsphere" });
const Hit = mongoose.model('Hit', hitsSchema);

exports.Hit = Hit;