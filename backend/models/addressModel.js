import mongoose, { Schema } from "mongoose";

// Define the Address schema
const addressSchema = new Schema({
    country: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: Number, required: true },
    street: { type: String, required: true },
    houseNumber: { type: Number, required: true }
});

addressSchema.methods.to_string = function() {
    return `${this.street} ${this.houseNumber}, ${this.zipCode} ${this.city}, ${this.country}`;
};

// Create the Address model
const Address = mongoose.model("Address", addressSchema);

export default Address;

