import mongoose, { Schema } from "mongoose";
import {ServiceType} from "./serviceTypeModel.js";
import ServiceStatus from "./serviceStatusModel.js";

const serviceRequestSchema = new Schema({
    serviceReceiver: { type: Schema.Types.ObjectId, ref: "ServiceReceiver", required: true },
    serviceProvider: { type:Schema.Types.ObjectId, ref:"ServiceProvider", required: true },
    log: [{
        status:{ type: String, enum: Object.values(ServiceStatus), required: true }, 
        timestamp: { type: Date, required: true }
    }],
    dateOptions: { type: [Date], required: true },
    subServiceType: { type: String, ref:"SubServiceType"},
    description: { type: String, required: true },
    location: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    distance: { type: Number, required: true },
    serviceStatus: { type: String, enum: Object.values(ServiceStatus), required: true },
    agreesToInspectionAppointmentIfNeeded: { type: Boolean, default: false },
    declineReason: {type: String },
    receiverDecline: {type: Boolean },
});

export const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);