import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import config from "./config.js";
import serviceReceiverRoutes from "./routes/serviceReceiverRoutes.js";
import serviceProviderRoutes from "./routes/serviceProviderRoutes.js";
import serviceWorkerRoutes from "./routes/serviceWorkerRoutes.js";
import serviceBookingRoutes from "./routes/serviceBookingRoutes.js";
import serviceOfferRoutes from "./routes/serviceOfferRoutes.js";
import dotenv from 'dotenv';
import authRoutes from "./routes/authRoutes.js";
import serviceConditionsRoutes from "./routes/serviceConditionsRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import bodyParser from 'body-parser';
import addressController from "./controller/addressController.js";
import serviceTypeRoutes from './routes/serviceTypeRoutes.js'
import {init} from './controller/serviceTypeController.js'
import subServiceRoutes from "./routes/subServiceRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import express from "express";
import analyticRoutes from "./routes/analyticRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


dotenv.config();

const PORT = 8080;

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// mount controllers
app.use("/users", userRoutes);
app.use("/serviceReceivers", serviceReceiverRoutes);
app.use("/serviceProviders", serviceProviderRoutes);
app.use("/serviceWorkers", serviceWorkerRoutes);
app.use("/serviceBookings", serviceBookingRoutes);
app.use("/serviceOffers", serviceOfferRoutes);
app.use("/serviceConditions", serviceConditionsRoutes);
app.use("/serviceRequests", serviceRequestRoutes);
app.use("/serviceTypes", serviceTypeRoutes);
app.use('/subServiceTypes', subServiceRoutes);
app.use("/api/auth", authRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/addresses', addressController);
app.use('/files', fileRoutes);
app.use('/analytics', analyticRoutes);
app.use('/notifications', notificationRoutes);

mongoose.connect(config.mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    init();
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server listening on ${PORT}`);
    });
}).catch((error) => {
    console.log(error);
});


