import mongoose, { Schema } from "mongoose";

const subServiceTypeSchema = new Schema({
    _id: { type: String, required: true },
    serviceTypeParent: { type: String, ref: "ServiceType" },
    name: { type: String, required: true },
    description: { type: String, required: true },
    optionName: { type: String },
    optionValues: [{ type: String }]
});

subServiceTypeSchema.pre('validate', function(next) {
    this._id = this.serviceTypeParent.concat("_",this.name);
    next();
});

export const SubServiceType = mongoose.model('SubServiceType', subServiceTypeSchema);
