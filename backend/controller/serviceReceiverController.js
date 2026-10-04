import express from "express";
import mongoose from "mongoose";
import { ServiceProvider } from "../models/serviceProviderModel.js";
import LogIn from "../models/logInModel.js";
import Address from "../models/addressModel.js";
import { Analytic } from "../models/analyticModel.js";
import { ServiceType } from "../models/serviceTypeModel.js";
import { SubServiceType } from "../models/subServiceTypeModel.js";
import ServiceReceiver from "../models/serviceReceiverModel.js";
import { log } from "console";
import { ServiceRequest } from "../models/serviceRequestModel.js";
import { ServiceOffer } from "../models/serviceOfferModel.js";
import { ServiceConditions } from "../models/serviceConditionsModel.js";

/**
 * Retrieve all service receivers
 * @returns all service receivers
 */
export const getAll = async (req, res) => {
    try {
        let serviceReceivers = await ServiceReceiver.find();
        return res.status(200).send(serviceReceivers);
    } catch (error) {
        return res.status(400).send(error);
    }
};

/**
 * Retrieve a service receiver by ID
 * @param {String} req.params.id - service receiver ID
 * @returns ServiceReceiver
 */
export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        let serviceReceiver = await ServiceReceiver.findById(id);
        return res.status(200).send(serviceReceiver);
    } catch (error) {
        return res.status(400).send(error);
    }
};

/**
 * Get a service receiver by last name
 * @param {String} req.params.lastName - last name of the service receiver 
 * @returns ServiceReceiver
 */
export const getByLastName = async (req, res) => {
    try {
        const { lastName } = req.params;
        let serviceReceiver = await ServiceReceiver.where({ lastName: lastName });
        return res.status(200).send(serviceReceiver);
    } catch (error) {
        return res.status(400).send(error);
    }
};

/**
 * Create a new service receiver
 * @param {email, password, country, city, zipCode, street, houseNumber, firstName, lastName, phoneNumber, hasEnabledAds} req.body - service receiver details
 * @returns ServiceReceiver
 */
export const create = async (req, res) => {
    try {
        const newLogIn = await LogIn.create({
            email: req.body.email,
            password: req.body.password,
            isServiceProvider: true,
        });
        const newAddress = await Address.create({
            country: req.body.country,
            city: req.body.city,
            zipCode: req.body.zipCode,
            street: req.body.street,
            houseNumber: req.body.houseNumber,
        });
        const newServiceReceiver = await ServiceReceiver.create({
            address: newAddress._id,
            logIn: newLogIn._id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            hasEnabledAds: req.body.hasEnabledAds,
        });
        return res.status(200).send(newServiceReceiver);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};

/**
 * Delete a service receiver by ID
 * @param {*} req.params.id - service receiver ID
 * @returns message
 */
export const deleteById = async (req, res) => {
    try {
        const { id } = req.params;
        await ServiceReceiver.findByIdAndDelete(id);
        return res.status(200).send("ok");
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};


/**
 * Returns all service conditions of a receiver
 * @param {String} req.params.id - ID of the receiver
 * @returns Array of service conditions
 */
export const getConditionsWithId = async (req, res) => {
    try {
        const id = req.params.id;
        const serviceRequests = await ServiceRequest.find({ serviceReceiver: id });
        const serviceOffers = [];
        for (let serviceRequest of serviceRequests) {
            const someServiceOffers = await ServiceOffer.find({ serviceRequest: { $in: serviceRequest._id } });
            someServiceOffers.forEach(offer => {
                serviceOffers.push(offer);
            });
        }
        const serviceConditions = [];
        for (let serviceOffer of serviceOffers) {
            const conditions = await ServiceConditions.find({ serviceOffer: { $in: serviceOffer._id } });
            conditions.forEach(condition => {
                serviceConditions.push(condition);
            });
        }
        return res.status(200).send(serviceConditions);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
}

/**
 * Updates a service receiver by ID
 * @param { serviceReceiverId, firstName, lastName, address, preferredPaymentMethod, phoneNumber, hasEnabledAds, email, password, profileImage } req.body - service receiver details
 * @returns updated ServiceReceiver
 */
export const update = async (req, res) => {
    const { serviceReceiverId, firstName, lastName, address, preferredPaymentMethod, phoneNumber, hasEnabledAds, email, password, profileImage } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const serviceReceiver = await ServiceReceiver.findById(serviceReceiverId).populate('address logIn');
        const logIn = await LogIn.findById(serviceReceiver.logIn);
        const addressObject = await Address.findById(serviceReceiver.address);
        if (!serviceReceiver) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send("ServiceReceiver not found");
        }

        // Update basic fields if they exist in the request body
        const fieldsToUpdate = { firstName, lastName, preferredPaymentMethod, phoneNumber, hasEnabledAds, profileImage };
        Object.keys(fieldsToUpdate).forEach(field => {
            if (fieldsToUpdate[field] !== undefined) {
                serviceReceiver[field] = fieldsToUpdate[field];
            }
        });

        // Update address fields if they exist in the request body
        if (address && serviceReceiver.address) {
            const addressFieldsToUpdate = ['street', 'city', 'state', 'zipCode', 'houseNumber', 'country'];
            addressFieldsToUpdate.forEach(field => {
                if (address[field] !== undefined) {
                    addressObject[field] = address[field];
                }
            });
        }

        // Update logIn fields if they exist in the request body
        if(serviceReceiver.logIn) {
            const loginFieldsToUpdate = { email, password };
            Object.keys(loginFieldsToUpdate).forEach(field => {
                if (loginFieldsToUpdate[field] !== undefined) {
                    logIn[field] = loginFieldsToUpdate[field];
                }
            });
        }

        await addressObject.save();
        await logIn.save();
        await serviceReceiver.save();

        await session.commitTransaction();
        session.endSession();

        return res.status(200).send(serviceReceiver.populate('address logIn'));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ error: error.message });
    }
};

/**
 * Sets the onboarding status of a service receiver to true
 * @param {*} req.body.serviceReceiverId - service receiver ID 
 * @returns message
 */
export const finishedOnboarding = async (req, res) => {
    const { serviceReceiverId } = req.body;

    try {
        let serviceReceiver = await ServiceReceiver.findById(serviceReceiverId);
        if (!serviceReceiver) {
            return res.status(404).send("ServiceReceiver not found");
        }

        serviceReceiver.hasCompletedOnboarding = true;
        await serviceReceiver.save();

        return res.status(200).send({ message: 'ServiceReceiver onboarding finished' });
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};
