import { ServiceRequest } from '../models/serviceRequestModel.js';
import Address from '../models/addressModel.js';
import { ServiceType } from '../models/serviceTypeModel.js';
import mongoose from 'mongoose';
import ServiceReceiver from '../models/serviceReceiverModel.js';
import { ServiceProvider } from '../models/serviceProviderModel.js';
import geocode from '../utils/geocode.js';
import getDistanceBetweenAddresses from '../utils/calculateDistance.js';
import { SubServiceType } from '../models/subServiceTypeModel.js';
import { createEmptyOffer } from './serviceOfferController.js';
import axios from 'axios';
import sendEmails from "../utils/sendEmails.js";

/**
 * Create a new service request
 * @param {serviceReceiverId, serviceProviderId, dateOptions, subServiceType, description, location, agreesToInspectionAppointmentIfNeeded} req.body - service request details
 * @returns ServiceRequest
 */
export const create = async (req, res) => {
    const { serviceReceiverId, serviceProviderId, dateOptions, subServiceType, description, location, agreesToInspectionAppointmentIfNeeded } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newSubServiceType = await SubServiceType.findOne({ name: subServiceType });

        const newAddress = await Address.create({
            country: location.country,
            city: location.city,
            zipCode: location.zipCode,
            street: location.street,
            houseNumber: location.houseNumber
        });

        const newDateOptions = [];
        dateOptions.forEach((element) => newDateOptions.push(Date.parse(element)));

        const serviceReceiver = await ServiceReceiver.findById(serviceReceiverId).session(session);
        const serviceProvider = await ServiceProvider.findById(serviceProviderId).session(session);
        const serviceProviderAddress = await Address.findById(serviceProvider.address).session(session);
        let distance = 0;
        try{
            distance = await getDistanceBetweenAddresses(serviceProviderAddress.to_string(), newAddress.to_string());
        }catch(error){
            throw new Error(`Error when calculating distance: ${error.message}`);
        }

        const newServiceRequest = await ServiceRequest.create({
            serviceReceiver: serviceReceiver,
            serviceProvider: serviceProvider,
            log: [{status: 'Request Initiated', timestamp: new Date()}],
            dateOptions: newDateOptions,
            subServiceType: newSubServiceType._id,
            description: description,
            location: newAddress,
            distance: distance,
            serviceStatus: 'Request Initiated',
            agreesToInspectionAppointmentIfNeeded: agreesToInspectionAppointmentIfNeeded
        });
        await newServiceRequest.save();

        await session.commitTransaction();
        session.endSession();
        console.log(`Service Request ${newServiceRequest._id} has been created.`)
        return res.status(201).json(newServiceRequest);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Updates status and creates a empty Service Offer (which can be denied/cancelled).
As all relevant values are required, we do not check for their validity again.
 * @param {String} req.body.serviceRequestId - ID of the service request
 * @returns ServiceOffer
 */
export const finalize = async (req,res) => {
    const { serviceRequestId } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const serviceRequestObject = await ServiceRequest.findById(serviceRequestId)
            .populate({
                path: 'serviceProvider',
                populate: {
                    path: 'logIn',
                    select: 'email'
                }
            })
            .populate('serviceReceiver', 'firstName');
        if(!serviceRequestObject){
            return res.status(400).json({ message: `No service request with the ID ${serviceRequestId} has been found.` });
        }
        serviceRequestObject.serviceStatus = 'Request Sent';
        serviceRequestObject.log.push({status: 'Request Sent', timestamp: new Date()});
        await serviceRequestObject.save();


        // Prepare req for createEmptyOffer
        const newReq = { body: { serviceRequestId: serviceRequestObject._id } };

        await sendEmails("newServiceRequest", {
            receiver: serviceRequestObject.serviceProvider._id,
            companyName: serviceRequestObject.serviceProvider.companyName,
            receiverFirstname: serviceRequestObject.serviceReceiver.firstName,
            email: serviceRequestObject.serviceProvider.logIn.email,
            subject: "New request in the Craftify portal "
        })

        res =  await createEmptyOffer(newReq, res);
        await session.commitTransaction();
        session.endSession();
        return res;
    }catch(error){
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Cancels a service request (can also be called by the serviceOfferController to cancel a offer/booking)
 * @param {serviceRequestId, declineReason, receiverDecline} req.body - Details about the cancellation
 * @returns message
 */
export const cancelRequest = async (req, res) => {
    const { serviceRequestId, declineReason, receiverDecline } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const serviceRequest = await ServiceRequest.findById(serviceRequestId);
        if(receiverDecline && ['Work in Progress', 'Payment Pending', 'Completed', 'Cancelled'].includes(serviceRequest.serviceStatus)){
            return res.status(500).json({ message: 'This service has already been closed (even though potentially not payed yet). Therefore changes are not possible anymore.' });
        }else if(!receiverDecline && ['Payment Pending', 'Completed', 'Cancelled'].includes(serviceRequest.serviceStatus)){
            return res.status(500).json({ message: 'This service has already been closed (even though potentially not payed yet). Therefore changes are not possible anymore.' });
        }
        serviceRequest.serviceStatus = 'Cancelled';
        serviceRequest.log.push({status: 'Cancelled', timestamp: new Date()});
        serviceRequest.declineReason = declineReason;
        serviceRequest.receiverDecline = receiverDecline;
        await serviceRequest.save();
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json(serviceRequest);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Retrieves all service requests
 * @returns all service requests
 */
export const getAll = async (req, res) => {
    try {
        const serviceRequests = await ServiceRequest.find()
            .populate('serviceReceiver')
            .populate('serviceProvider')
            .populate('dateOptions')
            .populate('location')
            .populate('subServiceType')
            .populate({
                path: 'subServiceType',
                populate: {
                    path: 'serviceTypeParent'
                }
            });
            return res.status(200).json(serviceRequests);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Retrieves a service request by its ID
 * @param {String} req.params.id
 * @returns ServiceRequest
 */
export const byId = async (req, res) => {
    try {
        const serviceRequest = await ServiceRequest.findById(req.params.id)
            .populate('serviceReceiver')
            .populate('serviceProvider')
            .populate('dateOptions')
            .populate('location');
        if (!serviceRequest) {
            return res.status(404).json({ message: 'Service Request not found' });
        }
        return res.status(200).json(serviceRequest);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Updates a service request by its ID
 * @param {String} req.params.id - ID of the service request to update
 * @param {serviceReceiver, serviceProvider, log, dateOptions, subServiceType, description, location, distance, serviceStatus, agreesToInspectionAppointmentIfNeeded, declineReason, receiverDecline} req.body - Updated service request details
 * @returns Updated ServiceRequest
 */
export const update = async (req, res) => {
    try {
        const updatedServiceRequest = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('serviceReceiver')
            .populate('serviceProvider')
            .populate('dateOptions')
            .populate('location');
        if (!updatedServiceRequest) {
            return res.status(404).json({ message: 'Service Request not found' });
        }
        if(['Work in Progress','Job Agreed','Offer Sent','Offer Filled','Request Sent','Payment Pending', 'Completed','Cancelled'].includes(updatedServiceRequest.serviceStatus)){
            return res.status(500).json({ message: 'This service has already been sent. Therefore changes are not possible anymore.' });
        }
        return res.status(200).json(updatedServiceRequest);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Deletes a service request by its ID
 * @param {String} req.params.id - ID of the service request to delete
 * @returns message
 */
export const deleteById = async (req, res) => {
    try {
        const deletedServiceRequest = await ServiceRequest.findByIdAndDelete(req.params.id);
        if (!deletedServiceRequest) {
            return res.status(404).json({ message: 'Service Request not found' });
        }
        return res.status(200).json({ message: 'Service Request deleted' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
