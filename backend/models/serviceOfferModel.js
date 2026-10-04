import mongoose, { Schema } from "mongoose";
import {ServiceRequest} from './serviceRequestModel.js';
import {ServiceConditions} from './serviceConditionsModel.js';


const serviceOfferSchema = new Schema({
    serviceRequest: { type: Schema.Types.ObjectId, ref: "ServiceRequest", required: true, unique:true },
    viewingConditions: { type: Schema.Types.ObjectId, ref: "ServiceConditions" },
    workingConditions: [{ type: Schema.Types.ObjectId, ref: "ServiceConditions" }],
    expectedOverallCost: { type: Number },
    initialExpectedCost: { type: Number },
    message: { type: String },
    specials: { type: String },
    hasBeenEdited: { type: Boolean, default: false },
});

export const ServiceOffer = mongoose.model('ServiceOffer', serviceOfferSchema);
