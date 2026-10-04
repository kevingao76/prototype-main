import mongoose, { Schema } from "mongoose";
import {ServiceBooking} from "./serviceBookingModel.js";
import PaymentType from "./paymentTypeModel.js";

const paymentSchema = new Schema({
    outstandingAmount: { type: Number, required: true },
    serviceBooking: { type: ServiceBooking.schema, required: true },
    paymentType: {
        type: String,
        enum: Object.values(PaymentType), // Using enum with PaymentType enum values
        required: false
    },
    inRates: { type: Boolean, default: false },
    monthlyRates: { type: Number },
    monthsToPay: { type: Number },
    paymentComplete: { type: Boolean, default: false }
});

export const Payment = mongoose.model('Payment', paymentSchema);
