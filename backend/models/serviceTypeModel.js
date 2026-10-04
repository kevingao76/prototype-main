import mongoose, { Schema } from "mongoose";

const serviceTypeSchema = new Schema({
    _id: { type: String, required: true, unique: true },
    image: { type: String },
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    link: { type: String },
    subServices: [{ type: String, ref: "SubServiceType" }],
});

serviceTypeSchema.pre('validate', function(next) {
    this._id = this.title;
    next();
});

export const ServiceType = mongoose.model('ServiceType', serviceTypeSchema);
