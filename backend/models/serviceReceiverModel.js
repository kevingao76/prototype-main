import { Schema } from "mongoose";
import { User } from './userModel.js';
import PaymentType from './paymentTypeModel.js'; // Import the PaymentType enum


// Define the schema for ServiceReceiver
const serviceReceiverSchema = new Schema({
    address: { type: Schema.Types.ObjectId, ref: "Address", required: true},
    preferredPaymentMethod: {
        type: String,
        enum: Object.values(PaymentType), // Using enum with PaymentType enum values
        required: false
    }
});

// Create the ServiceReceiver model
const ServiceReceiver = User.discriminator('ServiceReceiver', serviceReceiverSchema);

export default ServiceReceiver;
