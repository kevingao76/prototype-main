import mongoose, {Schema} from 'mongoose';


// Define the ServiceProvider schema
const serviceProviderSchema = new Schema({
    companyName: { type: String, required: true },
    description : { type:String },
    profilePicture: { type: String, default: "" }, // Add Path to Default Picture
    logIn: { type: Schema.Types.ObjectId, ref: "LogIn", required: true },
    address: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    serviceRadius: { type: Number },
    tradeLicense: {
        filename: { type: String }, 
        filepath: { type: String }
    },
    phoneNumber: { type: String },
    hasEnabledAds:{ type: Boolean, default: false},
    subServiceTypes: [{ type: String, ref: "SubServiceType" }],
    travelKilometerConstant: { type: Number},
    profileImage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'upload.files'
    },
    license: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'upload.files'
    },
    paymentInformation: { type: String },
    hasCompletedOnboarding: {
        type: Boolean,
        default: false
    },
    googleCalendar: {type: String},
    analytics: [{type: Schema.Types.ObjectId, ref: "Analytic" }]
});

// Create the ServiceProvider model
export const ServiceProvider = mongoose.model("ServiceProvider", serviceProviderSchema);