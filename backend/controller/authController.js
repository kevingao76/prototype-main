import express from 'express';
import LogIn from '../models/logInModel.js';
import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import sendEmails from '../utils/sendEmails.js';
import crypto from 'crypto';
import {body, validationResult} from 'express-validator';
import Address from "../models/addressModel.js";
import ServiceReceiver from "../models/serviceReceiverModel.js";
import {ServiceProvider} from "../models/serviceProviderModel.js";
import mongoose from 'mongoose';
import {User} from "../models/userModel.js";


const router = express.Router();

// Register a new login/user as ServiceReceiver
const registerLogIn = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {

        const {
            email,
            password,
            country,
            city,
            zipCode,
            street,
            houseNumber,
            firstName,
            lastName,
            phoneNumber,
            hasEnabledAds
        } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const logInExists = await LogIn.findOne({email});

        if (logInExists) {
            return res.status(400).json({errors: 'User already exists'});
        }

        const newLogIn = await LogIn.create({
            email,
            password,
        });

        const newAddress = await Address.create({
            country,
            city,
            zipCode,
            street,
            houseNumber
        });

        const newServiceReceiver = await ServiceReceiver.create({
            address: newAddress._id,
            logIn: newLogIn._id,
            firstName,
            lastName,
            phoneNumber,
            hasEnabledAds,
        });

        const verificationToken = newLogIn.generateVerificationToken();
        await newLogIn.save();
        //url to be updated when project gets deployed
        //const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}`;
        const verificationUrl = `${req.protocol}://localhost:3000/api/auth/verify-email?token=${verificationToken}`;
        const message = `Please verify your email address by clicking on the following link: \n\n ${verificationUrl}`;

        await sendEmails("eMailVerificationTemplate", {
            email: newLogIn.email,
            subject: 'Email Verification',
            message,
            name: firstName,
            verificationUrl,
            receiver: newServiceReceiver._id,
        });

        await session.commitTransaction();
        await session.endSession();

        return res.status(201).json({
            message: 'Verification email sent to your email address',
            newServiceReceiver
        });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error)
        return res.status(500).json({message: 'Email could not be sent'});
    }
});


// Register a new login/user as ServiceProvider
const registerServiceProvider = asyncHandler(async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            email,
            password,
            country,
            city,
            zipCode,
            street,
            houseNumber,
            companyName,
            phoneNumber,
            hasEnabledAds,
            license
        } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        const isServiceProvider = true;
        const logInExists = await LogIn.findOne({email});

        if (logInExists) {
            return res.status(400).json({message: 'User already exists'});
        }

        const newLogIn = await LogIn.create({
            email,
            password,
            isServiceProvider,
        });
        const newAddress = await Address.create({
            country,
            city,
            zipCode,
            street,
            houseNumber
        });

        const newServiceProvider = await ServiceProvider.create({
            address: newAddress._id,
            logIn: newLogIn._id,
            companyName,
            phoneNumber,
            hasEnabledAds,
            license,
        });

        const verificationToken = newLogIn.generateVerificationToken();
        await newLogIn.save();
        const verificationUrl = `${req.protocol}://localhost:3000/api/auth/verify-email?token=${verificationToken}`;

        const message = `Please verify your email address by clicking on the following link: \n\n ${verificationUrl}`;

        await sendEmails("eMailVerificationTemplate",{
            email: newLogIn.email,
            subject: 'Email Verification',
            message,
            name: companyName,
            verificationUrl,
            receiver: newServiceProvider._id,
        });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: 'Verification email sent to your email address',
            newServiceProvider
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res.status(500).json({message: 'Email could not be sent'});
    }
});


const authLogIn = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    const logIn = await LogIn.findOne({email});

    if (logIn && (await logIn.matchPassword(password))) {
        return res.status(200).json({
            message: 'Login successful',
            logIn: {
                _id: logIn._id,
                email: logIn.email,
                token: generateToken(logIn),
                isServiceProvider: logIn.isServiceProvider
            }
        });
    } else {
        console.log("Invalid email or password");
        return res.status(401).json({message: 'Invalid email or password'});
    }
});

const verifyEmail = asyncHandler(async (req, res) => {
    const {token} = req.query;

    if (!token) {
        return res.status(400).json({message: 'Invalid or missing token'});
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const logIn = await LogIn.findOne({
        verificationToken: hashedToken,
    });

    if (!logIn) {
        return res.status(400).json({message: 'Invalid or expired token'});
    }

    logIn.isVerified = true;
    logIn.verificationToken = undefined;
    await logIn.save();

    return res.status(200).json({message: 'Email verified successfully'});
});

const profile = asyncHandler(async (req, res) => {
    const loginObject = await LogIn.findOne({email: req.logIn.email});
    if (loginObject.isServiceProvider) {
        const providerProfile = await getProviderProfile(loginObject);
        return res.json(providerProfile);
    } else if (loginObject.isServiceProvider != null && loginObject.isServiceProvider != true && loginObject.isServiceProvider != undefined) {
        const receiverProfile = await getReceiverProfile(loginObject);
        return res.json(receiverProfile);
    } else {
        return res.status(400).json({message: "Couldn't fetch profile"});
    }
});

async function getProviderProfile(loginObject) {
    const provider = await ServiceProvider.findOne({logIn: loginObject._id}).populate('logIn').populate('address').populate('subServiceTypes');
    return provider;

}

async function getReceiverProfile(loginObject) {
    const receiver = await User.findOne({logIn: loginObject._id}).populate('logIn').populate('address').populate('subServiceTypes');
    return receiver;
}

const serviceProviderSearch = asyncHandler(async (req, res) => {
    let serviceProviders = await ServiceProvider.find();
    return res.status(200).send(serviceProviders);
});

export {registerLogIn, authLogIn, verifyEmail, registerServiceProvider, profile, serviceProviderSearch};
export default router;
