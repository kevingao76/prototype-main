import mongoose, { Schema } from "mongoose";


const analyticSchema = new Schema({
    serviceBooking: { type: Schema.Types.ObjectId, ref: 'ServiceBooking', required: true },
    timeBetweenRequestAndFirst: { type: Number },
    timeBetweenRequestAndLast: { type: Number },
    differenceBetweenInitialAndFinalCost: { type: Number },
    rating: { type: Schema.Types.ObjectId, ref: 'Rating' }
});

export const Analytic = mongoose.model('Analytic', analyticSchema);
