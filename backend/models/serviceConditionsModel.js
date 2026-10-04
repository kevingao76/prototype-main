import mongoose, { Schema } from "mongoose";

const serviceConditionsSchema = new Schema({
    serviceOffer: {type: Schema.Types.ObjectId, ref:"ServiceOffer"},
    hourlyRate: { type: Number, required: true },
    date: { type: Date, required: true },
    expectedDuration: { type: Number, required: true },  // Assuming duration in min
    expectedMaterialCost: { type: Number, required: true },
    expectedAdditionalCostFactors: [{
        description: {type: String, required: true},
        price: {type:Number, required: true}
    }],
    expectedTravelCost: { type: Number, required: true },
    expectedOverallCost: { type: Number, required: true },
    specialConditions: { type: String }
});

export const ServiceConditions = mongoose.model('ServiceConditions', serviceConditionsSchema);