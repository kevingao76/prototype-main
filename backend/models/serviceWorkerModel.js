import mongoose, { Schema } from "mongoose";
import { User } from './userModel.js';
import {ServiceProvider} from './serviceProviderModel.js';


// Define schemas for nested objects
const FileSchema = new Schema({
    filename: { type: String, required: true },
    filepath: { type: String, required: true }
});

// Extend the User schema for ServiceWorker
const serviceWorkerSchema = new Schema({
    company: {
        type: ServiceProvider.schema
    },
    serviceRadius: { type: Number, required: true }
});

// Create the ServiceWorker model
const ServiceWorker = User.discriminator('ServiceWorker', serviceWorkerSchema);

export { ServiceWorker };