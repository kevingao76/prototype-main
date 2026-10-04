import express from 'express';
import {ServiceOffer} from '../models/serviceOfferModel.js';
import {ServiceRequest} from '../models/serviceRequestModel.js';
import {ServiceProvider} from '../models/serviceProviderModel.js';
import {ServiceConditions} from '../models/serviceConditionsModel.js';
import { createEmptyBooking } from './serviceBookingController.js';
import { cancelRequest } from './serviceRequestController.js';
import { calculateOverallCost } from './serviceConditionsController.js';
import mongoose from 'mongoose';
import ServiceReceiver from '../models/serviceReceiverModel.js';
import sendEmails from "../utils/sendEmails.js";


/**
 * Create a new empty service offer (mostly called by the service request controller)
 * @param {serviceRequestId} req - The service request ID
 */
export const createEmptyOffer = async (req, res) => {
    const { serviceRequestId } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const newServiceRequest = await ServiceRequest.findById(serviceRequestId);
        if(!newServiceRequest){
            res.status(404).json({ message: `No Service Request with the ID ${serviceRequestId} has been found.` });
        }
        const newServiceOffer = await ServiceOffer.create({
            serviceRequest: newServiceRequest._id,
        });

        if(!('Request Sent' === newServiceRequest.serviceStatus)){
            res.status(500).json({ message: 'This service has to be sent and cannot be further processed to be initialized here. Premature or delayed creation is not allowed.' });
        }
        console.log(`An empty service offer with the id ${newServiceOffer._id} has been created.`)
        await session.commitTransaction();
        session.endSession();
        res.status(201).json(newServiceOffer);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: error.message });
    }
};

/**
 * Fill the empty service offer with the necessary information
 * @param {serviceOfferId, viewingConditionsId, workingConditionsIds, message, specials} req.body - The data to fill the service offer 
 * @param {*} res 
 * @returns Filled service offer
 */
export const fill = async (req, res) =>{
    const { serviceOfferId, viewingConditionsId, workingConditionsIds, message, specials } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const serviceOfferObject = await ServiceOffer.findById(String(serviceOfferId));
        if (!serviceOfferObject) {
            return res.status(400).json({ message: `No service offer with the ID ${serviceOfferObject._id} has been found.` });
        }
        const serviceRequestObject = await ServiceRequest.findById(String(serviceOfferObject.serviceRequest));
        if(!('Request Sent' == serviceRequestObject.serviceStatus)){
            return res.status(500).json({ message: 'This service offer has already been sent. Therefore changes are not possible anymore.' });
        }
        const workingConditions = [];
        for(let workingConditionId of workingConditionsIds){
            const newWorkingCondition = await ServiceConditions.findById(String(workingConditionId));
            if(!newWorkingCondition){
                return res.status(404).json({ message: `No workingCondition with the ID ${workingConditionId} has been found.` });
            }
            workingConditionId = newWorkingCondition._id;
            await newWorkingCondition.save();
            workingConditions.push(newWorkingCondition);
        }

        var newExpectedOverallCost = 0;
        workingConditions.forEach((workingCondition) => (newExpectedOverallCost = newExpectedOverallCost + workingCondition.expectedOverallCost))

        let newOffer = {};

        if(!viewingConditionsId){
            newOffer = {
                workingConditions: workingConditionsIds,
                expectedOverallCost: newExpectedOverallCost,
                message: message,
                specials: specials
            };
        }else{
            const viewingConditionsObject = await ServiceConditions.findById(String(viewingConditionsId));
            newExpectedOverallCost = viewingConditionsObject.expectedOverallCost + newExpectedOverallCost;
            newOffer = {
                viewingConditions: viewingConditionsObject._id,
                workingConditions: workingConditionsIds,
                expectedOverallCost: newExpectedOverallCost,
                message: message,
                specials: specials
            };
        }
        serviceRequestObject.serviceStatus = 'Offer Filled';
        serviceRequestObject.log.push({status: 'Offer Filled', timestamp: new Date()});
        await serviceRequestObject.save();
        await ServiceOffer.findByIdAndUpdate(serviceOfferId, newOffer);
        await session.commitTransaction();
        session.endSession();
        res.status(201).json(await ServiceOffer.findById(serviceOfferObject._id)
            .populate('serviceRequest')
            .populate('viewingConditions')
            .populate('workingConditions'));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Adds all conditions included in the conditions Id list from the service offer
 * @param {serviceOfferId, workingConditionsIds} req.body, workingConditionsIds: ids to add, serviceOfferId: id of the service offer 
 * @returns updated service offer
 */
export const addConditions = async (req, res) => { 
    const { serviceOfferId, workingConditionsIds } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log(serviceOfferId, 'service offer id', workingConditionsIds, 'working conditions ids');
    try {
        const serviceOfferObject = await ServiceOffer.findById(String(serviceOfferId));
        for(let workingConditionId of workingConditionsIds){
            const newWorkingCondition = await ServiceConditions.findById(String(workingConditionId));
            if(!newWorkingCondition){
                throw Error (`No workingCondition with the ID ${workingConditionId} has been found.`);
            }
            serviceOfferObject.workingConditions.push(newWorkingCondition._id);
        }
        serviceOfferObject.hasBeenEdited = true;
        await serviceOfferObject.save();

        await session.commitTransaction();
        session.endSession();
        res.status(201).json(await ServiceOffer.findById(serviceOfferObject._id)
            .populate('serviceRequest')
            .populate('viewingConditions')
            .populate('workingConditions'));
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Removes all conditions included in the conditions Id list from the service offer
 * @param {serviceOfferId, workingConditionsIds} req.body, workingConditionsIds: ids to remove, serviceOfferId: id of the service offer
 * @returns Updated service offer
 */
export const removeConditions = async (req, res) => {
    const { serviceOfferId, workingConditionsIds } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const serviceOfferObject = await ServiceOffer.findById(String(serviceOfferId));
        for(let workingConditionId of workingConditionsIds){
            const newWorkingCondition = await ServiceConditions.findById(String(workingConditionId));
            if(!newWorkingCondition){
                throw Error (`No workingCondition with the ID ${workingConditionId} has been found.`);
            }
            serviceOfferObject.workingConditions.pull(newWorkingCondition._id);
        }
        serviceOfferObject.hasBeenEdited = true;
        await serviceOfferObject.save();

        await session.commitTransaction();
        session.endSession();
        res.status(201).json(await ServiceOffer.findById(serviceOfferObject._id)
            .populate('serviceRequest')
            .populate('viewingConditions')
            .populate('workingConditions'));
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Finalize the service offer and create a new service booking
 * @param {String} req.body.id - The service offer ID
 * @returns Empty service booking
 */
export const finalize = async (req, res) => {
    try {
        const { id } = req.body;
        const serviceOffer = await ServiceOffer.findById(id);
        if (!serviceOffer) {
            return res.status(404).json({ message: 'ServiceOffer not found' });
        }
        const serviceRequest = await ServiceRequest.findById(serviceOffer.serviceRequest)
            .populate({
                path: 'serviceProvider',
                populate: {
                    path: 'logIn',
                    select: 'email'
                }
            })
            .populate('serviceReceiver', 'firstName');
        if (serviceRequest === undefined || serviceOffer.expectedOverallCost === undefined) {
            return res.status(400).json({ message: 'serviceRequest or expectedOverallCost is undefined' });
        }

        if('Offer Sent' == serviceRequest.serviceStatus){
            return res.status(500).json({ message: 'This service offer has already been sent. Therefore changes are not possible anymore.' });
        }

        const workingConditionsNotEmpty = serviceOffer.workingConditions && serviceOffer.workingConditions.length > 0;

        if (!workingConditionsNotEmpty) {
            return res.status(400).json({ message: 'At least one workingCondition must not be empty' });
        }

        await sendEmails("newServiceOffer", {
            receiver: serviceRequest.serviceReceiver._id,
            companyName: serviceRequest.serviceProvider.companyName,
            receiverFirstname: serviceRequest.serviceReceiver.firstName,
            email: serviceRequest.serviceProvider.logIn.email,
            subject: "New offer in the Craftify portal"
        })

        serviceRequest.serviceStatus = 'Offer Sent';
        serviceRequest.log.push({status: 'Offer Sent', timestamp: new Date()});
        await serviceRequest.save();

        serviceOffer.initialExpectedCost = parseFloat(serviceOffer.expectedOverallCost.toFixed(2));
        await serviceOffer.save();

        // Prepare req for createEmptyOffer
        const newReq = { body: { serviceOfferId: serviceOffer._id } };

        return await createEmptyBooking(newReq, res);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Cancel a service offer (calls the cancel function of the service request controller)
 * @param {serviceOfferId, declineReason, receiverDecline} req.body - The data to cancel the service offer
 * @returns message
 */
export const cancelOffer = async (req, res) => {
    const { serviceOfferId, declineReason, receiverDecline } = req.body;
    try{
        const serviceOffer = await ServiceOffer.findById(serviceOfferId);
        const newReq = { body: { serviceRequestId: serviceOffer.serviceRequest, declineReason:declineReason, receiverDecline:receiverDecline } };
        return await cancelRequest(newReq, res);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Retrieve all service offers
 * @returns all service offers
 */
export const getAll = async (req, res) => {
    try {
        const serviceOffers = await ServiceOffer.find()
            .populate('serviceRequest')
            .populate('viewingConditions')
            .populate('workingConditions');
        return res.status(200).json(serviceOffers);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Get all offers by specific service requests
 * @param {[String]} req.params.requestIds - The IDs of the service requests to retrieve offers for
 * @returns [ServiceOffer] - The offer for the given service requests
 */
export const getOffersByRequests = async (req, res) => {
    try {
        const serviceRequestIds = req.params.requestIds;
        const serviceOffers = await ServiceOffer.find({serviceRequest: { $in: serviceRequestIds }})
        .populate('serviceRequest')
        .populate('viewingConditions')
        .populate('workingConditions');
        return res.status(200).json(serviceOffers);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Retrieve all service offers by service offer ID
 * @param {String} req.params.id - The service offer ID
 * @returns message
 */
export const byId = async (req, res) => {
    try {
        const serviceOffer = await ServiceOffer.findById(req.params.id)
            .populate('serviceRequest')
            .populate('viewingConditions')
            .populate('workingConditions');
        if (!serviceOffer) {
            return res.status(404).json({ message: 'Service Offer not found' });
        }
        return res.status(200).json(serviceOffer);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Updates the service offer
 * @param {String} req.params.id - The service offer ID
 * @returns Updated service offer
 */
export const update = async (req, res) => {
    try {
        const updatedServiceOffer = await ServiceOffer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('serviceRequest')
            .populate('viewingConditions')
            .populate('workingConditions');
        if (!updatedServiceOffer) {
            return res.status(404).json({ message: 'Service Offer not found' });
        }
        updatedServiceOffer.hasBeenEdited = true;
        await updatedServiceOffer.save();
        return res.status(200).json(updatedServiceOffer);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Deletes a service offer
 * @param {String} req.params.id - The service offer ID
 * @returns message
 */
export const deleteById = async (req, res) => {
    try {
        const deletedServiceOffer = await ServiceOffer.findByIdAndDelete(req.params.id);
        if (!deletedServiceOffer) {
            return res.status(404).json({ message: 'Service offer not found' });
        }
        return res.status(200).json({ message: 'Service offer deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Calculates the overall resources (cost, hours, appointmentsHappened) committed to a booking and saves them towards the matching Offer (the individual serviceConditions).
 * @param {*} serviceOfferId
 * @returns Object with overallCost, overallHours, appointmentsHappened
 */
export const recalcOverallResources = async (serviceOfferId) => {
    const serviceOffer = await ServiceOffer.findById(serviceOfferId);
    const serviceRequest = await ServiceRequest.findById(serviceOffer.serviceRequest).populate('serviceProvider');
    const workingConditions = await ServiceConditions.find({ _id: { $in: serviceOffer.workingConditions } });
    const viewingConditions = await ServiceConditions.findById(serviceOffer.viewingConditions);
    let allConditions = workingConditions;
    if (viewingConditions) {
        allConditions = [viewingConditions].concat(workingConditions);
    }
    
    let overallCost = 0.0;
    let overallHours = 0;
    const appointmentsHappened = [];

    const promises = allConditions.map(async (condition) => {
        appointmentsHappened.push(condition.date.toDateString());
        const { cost, hours } = await calculateOverallCost(condition, serviceRequest.serviceProvider.travelKilometerConstant, serviceRequest.distance);
        console.log(cost, 'conditionCost');
        console.log(hours, 'conditionHours');
        overallHours += hours;
        overallCost += parseFloat(cost.toFixed(2));
    });

    await Promise.all(promises);
    
    console.log(overallCost, 'overallCost');
    serviceOffer.expectedOverallCost = parseFloat(overallCost.toFixed(2));
    await serviceOffer.save();

    return { overallCost, overallHours, appointmentsHappened };
}