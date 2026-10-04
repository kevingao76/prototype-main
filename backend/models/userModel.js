import mongoose, { Schema } from "mongoose";

// Define the User schema
const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    logIn: { 
        type: Schema.Types.ObjectId, 
        ref: "LogIn", 
        required: true 
    },
    phoneNumber: {
        type: String,
        required: true
    },
    hasEnabledAds: {
        type: Boolean,
        required: false,
        default: false
    },
    profileImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'upload.files'
    },
    hasCompletedOnboarding: {
        type: Boolean,
        default: false
    }
});

// Create the User model
export const User = mongoose.model("User", userSchema);
