const mongoose = require('mongoose');

// const addressSchema = new mongoose.Schema({
//     description: { type: String },
//     street: { type: String },
//     zipcode: { type: String },
//     country: { type: String },
//     state: { type: String },
//     city: { type: String },
//     locality: { type: String },
//     phone: { type: String },
//     googlePlaceId: { type: String }
// });

// const salaahTimesSchema = new mongoose.Schema({
//     fajr: { type: String },
//     zuhr: { type: String },
//     asr: { type: String },
//     maghrib: { type: String },
//     isha: { type: String },
//     jumah: { type: String }
// })
// const Double = mongoose.Schema.Types.Double;
// const locationSchema = new mongoose.Schema({
//     type: { type: String, default: "Point" },
//     coordinates: [Double]
// })
const masjidSchema = new mongoose.Schema({
    _masjidId: { type: String, default: "" },
    masjidName: { type: String, required: true },
    masjidAddress: {
        description: { type: String },
        street: { type: String },
        zipcode: { type: String },
        country: { type: String },
        state: { type: String },
        city: { type: String },
        locality: { type: String },
        phone: { type: String },
        googlePlaceId: { type: String, required: true }
    },
    masjidLocation: {
        type: { type: String },
        coordinates: []
    },
    masjidTimings: {
        fajr: { type: String },
        zuhr: { type: String },
        asr: { type: String },
        maghrib: { type: String },
        isha: { type: String },
        jumah: { type: String }
    },
    masjidCreatedby: { type: String },
    masjidModifiedby: { type: String },
    masjidCreatedon: { type: Date },
    masjidModifiedon: { type: Date },
    masjidPic: [],
    // [BsonIgnore]
    Distance: { type: String, default: "" },
    notMasjid: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
});

masjidSchema.index({ masjidLocation: "2dsphere" });
const Masjid = mongoose.model('Masjid', masjidSchema);

exports.Masjid = Masjid;