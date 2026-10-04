import express from "express";
import mongoose from "mongoose";
import { ServiceProvider } from "../models/serviceProviderModel.js";
import LogIn from "../models/logInModel.js";
import Address from "../models/addressModel.js";
import { Analytic } from "../models/analyticModel.js";
import { ServiceType } from "../models/serviceTypeModel.js";
import { SubServiceType } from "../models/subServiceTypeModel.js";
import getDistanceBetweenAddresses from "../utils/calculateDistance.js";
import { ServiceRequest } from "../models/serviceRequestModel.js";
import { ServiceOffer } from "../models/serviceOfferModel.js";
import { ServiceConditions } from "../models/serviceConditionsModel.js";


/**
 * Retrieve all service providers
 * @returns all service providers
 */
export const getAll = async (req, res) => {
    try {
        let serviceProviders = await ServiceProvider.find().populate('logIn address analytics subServiceTypes').populate({
            path: 'analytics',
            populate: {
                path: 'rating'
            }
        });
        return res.status(200).send(serviceProviders);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};

/**
 * Retrive all service providers with a specific subServiceType and a location
 * @param {subServiceId,location} req.params - subServiceId and location
 * @returns Array of service providers
 */
export const getWithConditions = async (req, res) => {
    try {
        const subServiceId = req.params.subServiceId;
        const location = req.params.location;
        let serviceProviders = await ServiceProvider.find({ subServiceTypes: { $in: [subServiceId] } }).populate('logIn address subServiceTypes').populate({
            path: 'analytics',
            populate: {
                path: 'rating'
            }
        });
        const providersInRadius = await Promise.all(serviceProviders.map(async provider => {
            const providerAddress = `${provider.address.street}, ${provider.address.houseNumber}, ${provider.address.city}, ${provider.address.zipCode}, ${provider.address.country}`;
            const distance = await getDistanceBetweenAddresses(providerAddress, location);
            return {
                provider,
                isWithinRadius: distance / 1000 <= provider.serviceRadius
            };
        }));

        const serviceProvidersWithinRadius = providersInRadius
            .filter(result => result.isWithinRadius)
            .map(result => result.provider);
        return res.status(200).send(serviceProvidersWithinRadius);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};

/**
 * Get service provider by ID
 * @param {String} req.params.id - ID of the service provider
 * @returns Service Provider
 */
export const byId = async (req, res) => {
    try {
        const { id } = req.params;
        let serviceProvider = await ServiceProvider.findById(id).populate('logIn address analytics subServiceTypes').populate({
            path: 'analytics',
            populate: {
                path: 'rating'
            }
        });
        if (!serviceProvider) {
            return res.status(404).send({ error: "ServiceProvider not found" });
        }
        return res.status(200).send(serviceProvider);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};

/**
 * Get all providers with a certain company name
 * @param {String} req.params - Company name
 * @returns service providers
 */
export const byCompanyName = async (req, res) => {
    try {
        const { companyName } = req.params;
        let serviceProviders = await ServiceProvider.where({ companyName: companyName }).populate('logIn address analytics subServiceTypes');
        return res.status(200).send(serviceProviders);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};

/**
 * Returns all service conditions of a provider
 * @param {String} req.params.id - ID of the provider
 * @returns Array of service conditions
 */
export const getConditionsWithId = async (req, res) => {
    try {
        const id = req.params.id;
        const serviceRequests = await ServiceRequest.find({ serviceProvider: id });
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
 * Create a new service provider
 * @param {companyName, email, password, address, serviceRadius, tradeLicense} req .body - Company name, email, password, address, service radius, trade license
 * @returns Created service provider
 */
export const create = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { companyName, email, password, address, serviceRadius, tradeLicense } = req.body;

        const newLogIn = await LogIn.create({ email, password, serviceProvider: true });
        const newAddress = await Address.create(address);
        const newServiceProvider = await ServiceProvider.create({
            companyName,
            logIn: newLogIn._id,
            address: newAddress._id,
            serviceRadius,
            tradeLicense,
        });

        await session.commitTransaction();
        session.endSession();
        return res.status(200).send(newServiceProvider);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ error: error.message });
    }
};

/**
 * Delete a service provider by ID
 * @param {String} req.params.id - ID of the service provider
 * @returns message
 */
export const deleteById = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const serviceProvider = await ServiceProvider.findById(id).session(session);
        if (!serviceProvider) {
            throw new Error('ServiceProvider not found');
        }

        const logInId = serviceProvider.logIn;
        const addressId = serviceProvider.address;
        const analyticsId = serviceProvider.analytics;

        await ServiceProvider.findByIdAndDelete(id).session(session);
        await LogIn.findByIdAndDelete(logInId).session(session);
        await Address.findByIdAndDelete(addressId).session(session);
        if (analyticsId) {
            await Analytic.findByIdAndDelete(analyticsId).session(session);
        }
        await session.commitTransaction();
        session.endSession();
        return res.status(200).send({ message: 'ServiceProvider and related records deleted successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ error: error.message });
    }
};

/**
 * Create a new service provider
 * Example for subServiceTypes: [{ "parentName":"Painting Services", "name":"Interior Walls or Ceilings"}, { "parentName":"Painting Services", "name":"Exterior walls"}]
 * @param {serviceProviderId, companyName, email, password, description, serviceRadius, tradeLicense,subServiceTypes, hasEnabledAds, travelKilometerConstant, phoneNumber, address, analytics, profileImage, paymentInformation, googleCalendar } req.body - Request body
 * @returns Updated service provider
 */
export const update = async (req, res) => {
    const { serviceProviderId, companyName, email, password, description, serviceRadius, tradeLicense, subServiceTypes, hasEnabledAds, travelKilometerConstant, phoneNumber, address, analytics, paymentInformation, googleCalendar } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const serviceProvider = await ServiceProvider.findById(serviceProviderId).populate('logIn address analytics');
        const logIn = await LogIn.findById(serviceProvider.logIn);
        const addressObject = await Address.findById(serviceProvider.address);
        const analyticsObject = await Analytic.findById(serviceProvider.analytics);
        if (!serviceProvider) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send("ServiceProvider not found");
        }

        // Update basic fields if they exist in the request body
        const fieldsToUpdate = { companyName, description, serviceRadius, tradeLicense, hasEnabledAds, travelKilometerConstant, phoneNumber, googleCalendar };
        Object.keys(fieldsToUpdate).forEach(field => {
            if (fieldsToUpdate[field] !== undefined) {
                serviceProvider[field] = fieldsToUpdate[field];
            }
        });

        // Update subServiceTypes if provided
        const updateSubServiceTypes = [];
        for (let iterator of subServiceTypes) {
            updateSubServiceTypes.push(await getSubServiceType(iterator.parentName, iterator.name));
        }
        serviceProvider.subServiceTypes = updateSubServiceTypes;


        // Update login fields if they exist in the request body
        if (email || password) {
            {
                const loginFieldsToUpdate = { email, password };
                Object.keys(loginFieldsToUpdate).forEach(field => {
                    if (loginFieldsToUpdate[field] !== undefined) {
                        logIn[field] = loginFieldsToUpdate[field];
                    }
                });
            }
        }

        // Update address fields if they exist in the request body
        if (address && serviceProvider.address) {
            const addressFieldsToUpdate = ['street', 'city', 'state', 'zipCode', 'houseNumber', 'country'];
            addressFieldsToUpdate.forEach(field => {
                if (address[field] !== undefined) {
                    addressObject[field] = address[field];
                }
            });
        }

        // Update analytics if provided
        if (analytics) {
            if (!analyticsObject) {
                serviceProvider.analytics = await Analytic.create(analytics);
            } else {
                const analyticsFieldsToUpdate = { data: analytics.data };
                Object.keys(analyticsFieldsToUpdate).forEach(field => {
                    if (analyticsFieldsToUpdate[field] !== undefined) {
                        analyticsObject[field] = analyticsFieldsToUpdate[field];
                    }
                });
                await analyticsObject.save();
            }
        }
        if (paymentInformation) {
            serviceProvider.paymentInformation = paymentInformation;
        }

        await logIn.save();
        await addressObject.save();
        await serviceProvider.save();

        await session.commitTransaction();
        session.endSession();

        return res.status(200).send({ message: 'ServiceProvider updated successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ error: error.message });
    }
};

/**
 * Saves that the provider has finished his onboarding
 * @param {String} req.body.serviceProviderId - ID of the service provider
 * @returns message
 */
export const finishedOnboarding = async (req, res) => {
    const { serviceProviderId } = req.body;

    try {
        let serviceProvider = await ServiceProvider.findById(serviceProviderId);
        if (!serviceProvider) {
            return res.status(404).send("ServiceProvider not found");
        }

        serviceProvider.hasCompletedOnboarding = true;
        await serviceProvider.save();

        return res.status(200).send({ message: 'ServiceProvider finished onboarding successfully' });
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};

/**
 * Allows the provider to import his google calendar
 * @param {serviceProviderId, googleCalendarId} req.body - Id of the service provider and the google calendar id
 * @returns message
 */
export const importGoogleCalendar = async (req, res) => {
    const { serviceProviderId, googleCalendarId } = req.body;

    try {
        let serviceProvider = await ServiceProvider.findById(serviceProviderId);
        if (!serviceProvider) {
            return res.status(404).send("ServiceProvider not found");
        }

        serviceProvider.googleCalendar = googleCalendarId;
        await serviceProvider.save();

        return res.status(200).send({ message: 'Google Calendar Id for Provider saved successfully' });
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};

/**
 * Retrieves the subServiceType by name and serviceType by name
 * @param {String} serviceName 
 * @param {String} subServiceName 
 * @returns subService object
 */
async function getSubServiceType(serviceName, subServiceName) {
    const serviceType = await ServiceType.findOne({ title: serviceName });
    const subService = await SubServiceType.findOne({ serviceTypeParent: serviceType._id, name: subServiceName });
    if (subService) {
        return subService;
    } else {
        throw new Error(`Service ${subServiceName} not found`);
    }
};