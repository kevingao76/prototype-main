import mongoose, { Schema } from "mongoose";
import {ServiceOffer} from './serviceOfferModel.js';

const serviceBookingSchema = new Schema({
    serviceOffer: { type: Schema.Types.ObjectId, ref: "ServiceOffer", required: true, unique: true},
    finalHours: { type: Number },
    finalOverallCost: { type: Number },
    payment:{
        invoiceId: { type: String },
        invoiceStatus: { type: String },
        invoiceUrl: { type: String },
        bill: { type: mongoose.Schema.Types.ObjectId, ref: 'upload.files' },
        receipt: { type: String }
    },
    appointmentsHappened: [{ type: Date }],
    finishedDate: { type: Date },
    finishedWithoutComplications: { type: Boolean },
    analytics: { type: Schema.Types.ObjectId, ref: "Analytic" },
});

export const ServiceBooking = mongoose.model('ServiceBooking', serviceBookingSchema);
