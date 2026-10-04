import mongoose from 'mongoose';
import Stripe from 'stripe';
import { ServiceBooking } from '../models/serviceBookingModel.js';
import { ServiceOffer } from '../models/serviceOfferModel.js';
import { ServiceRequest } from '../models/serviceRequestModel.js';
import { ServiceConditions } from '../models/serviceConditionsModel.js';
import { create, update } from './serviceConditionsController.js';
import { cancelOffer } from './serviceOfferController.js';
import { recalcOverallResources } from './serviceOfferController.js';
import dotenv from 'dotenv';
import { ServiceProvider } from '../models/serviceProviderModel.js';
import sendEmails from '../utils/sendEmails.js';
import ServiceReceiver from '../models/serviceReceiverModel.js';
import axios from 'axios';
import FormData from 'form-data';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_PRIVATE_API_KEY, { apiVersion: '2020-08-27' });


/**
 * Creates an empty booking, which has to be filled (usually called by service offer controller after finalizing offer)
 * @param {String} req.body.serviceOfferId - The ID of the service offer to create the booking for 
 * @returns empty ServiceBooking
 */
export const createEmptyBooking = async (req, res) => {
    const { serviceOfferId } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const serviceOffer = await ServiceOffer.findById(serviceOfferId).populate('serviceRequest');
        if(!serviceOffer){
            return res.status(404).json({ message: `No Service Offer with the ID ${serviceOfferId} has been found.` });
        }

        if(!('Offer Sent' == serviceOffer.serviceRequest.serviceStatus)){
            return res.status(500).json({ message: 'This service offer must be sent to be initiated as a booking. Therefore initialization is not possible.' });
        }
        const newServiceBooking = await ServiceBooking.create({
            serviceOffer: serviceOffer._id,
        });

        await session.commitTransaction();
        session.endSession();
        return res.status(201).json(newServiceBooking);
    } catch (error) {
        if(session.inTransaction()){
            await session.abortTransaction();
            session.endSession();
        }
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Lets the receiver agree to the service booking
 * @param {String} req.body.id - The ID of the service booking to agree to
 * @returns 
 */
export const agree = async (req, res) => {
  const {id} = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    const booking = await ServiceBooking.findById(id);
    const offer = await ServiceOffer.findById(booking.serviceOffer);
    const request = await ServiceRequest.findById(offer.serviceRequest);
    
    if(!('Offer Sent' == request.serviceStatus)){
      return res.status(500).json({ message: 'This service offer must be sent to be agreed too.' });
    }

    request.serviceStatus = 'Job Agreed';
    request.log.push({status: 'Job Agreed', timestamp: new Date()});
    await request.save();
    await offer.save();
    await booking.save();
    await session.commitTransaction();
    session.endSession();
    return res.status(201).json(booking);
  }catch(error){
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
};


/**
 * Sets the work in progress. Locks in the appointment, so that the receiver can no longer cancel the service. Only available 24h before the first appointment
 * @param {String} req.body.serviceBookingId - The ID of the service booking to set to work in progress
 * @returns ServiceBooking
 */
export const initWorkInProgress = async (req, res) => {
    const serviceBookingId = req.body.serviceBookingId;
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const serviceBooking = await ServiceBooking.findById(serviceBookingId);
        if(!serviceBooking){
            if(session.inTransaction()){
                await session.abortTransaction();
                session.endSession();
            }
            return res.status(404).json({ message: `The selected Service Booking has not been found.` });
        }
        const serviceOffer = await ServiceOffer.findById(serviceBooking.serviceOffer).populate('viewingConditions').populate('workingConditions');
        const serviceRequest = await ServiceRequest.findById(serviceOffer.serviceRequest);

        if(serviceRequest.serviceStatus != 'Job Agreed'){
            if(session.inTransaction()){
                await session.abortTransaction();
                session.endSession();
            }
            return res.status(403).json({ message: `The work can only be started, if it was last agreed by the customer.` });
        }
        let anyConditions = serviceOffer.workingConditions;
        if(serviceOffer.viewingConditions){
            anyConditions = [serviceOffer.viewingConditions].concat(serviceOffer.viewingConditions);
        }
        const isLessThan24HoursAway = (dateToTest) => (dateToTest - new Date()) < (24 * 60 * 60 * 1000) && (dateToTest - new Date()) > 0;
        let changeAble = false;

        anyConditions.forEach((condition) => {
            if(isLessThan24HoursAway(condition.date)){
                changeAble = true;
            }});

        if(changeAble){
            serviceRequest.serviceStatus = 'Work in Progress';
            serviceRequest.log.push({status: 'Work in Progress', timestamp: new Date()});
            await serviceRequest.save({ session });
            await serviceOffer.save({ session });
            await serviceBooking.save({ session });
            await session.commitTransaction();
            session.endSession();
            return res.status(200).json(serviceBooking);
        }else{
            if(session.inTransaction()){
                await session.abortTransaction();
                session.endSession();
            }
            return res.status(405).json({ message: 'Please wait until at least 24h before the first appointment to confirm the start of your work.' });
        }
    }catch(error){
        if(session.inTransaction()){
            await session.abortTransaction();
            session.endSession();
        }
        return res.status(500).json({ message: error.message });
    }
}

/**
 * If the provider or receiver need to adjust the conditions of the service, this can be called
 * @param {serviceBookingId, viewingConditions, workingConditions} req.body, where viewingConditions is a servicCondition object the workingConditions are arrays of conditions
 * @returns ServiceBooking
 */
export const adjustConditionsOfService = async (req, res) => {
    const { serviceBookingId, viewingConditions, workingConditions } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const serviceBooking = await ServiceBooking.findById(serviceBookingId);
        const serviceOffer = await ServiceOffer.findById(serviceBooking.serviceOffer);
        const serviceRequest = await ServiceRequest.findById(serviceOffer.serviceRequest);

        if(['Payment Pending', 'Completed','Cancelled'].includes(serviceRequest.serviceStatus)){
            if(session.inTransaction()){
                await session.abortTransaction();
                session.endSession();
            }
            return res.status(500).json({ message: 'This service has already been closed (even though potentially not payed yet). Therefore changes are not possible anymore.' });
        }
        if(!viewingConditions && !workingConditions && workingConditions.length > 0){
            if(session.inTransaction()){
                await session.abortTransaction();
                session.endSession();
            }
            return res.status(500).json({ message: 'No viewing or working conditions have been provided. Please ensure that you provide the updated conditions.' });
        }
        let allConditions = []
        if(viewingConditions){
            allConditions = workingConditions.push(viewingConditions);
        }else{
            allConditions = workingConditions;
        }

        for(let condition of allConditions){
            const serviceCondition = ServiceConditions.findById(condition._id);
            const newReq = { body: { serviceOfferId: serviceOffer._id, hourlyRate: condition.hourlyRate,
                date: condition.date, expectedDuration: condition.expectedDuration, expectedMaterialCost: condition.expectedMaterialCost,
                expectedAdditionalCostFactors: condition.expectedAdditionalCostFactors, specialConditions: condition.specialConditions
            }};

            if(!serviceCondition){
                const newServiceCondition = await create(newReq, res);
                serviceOffer.workingConditions.push(newServiceCondition);
                await serviceOffer.save();
            }else{
                await update(newReq, res);
            }
        }
        await recalcOverallResources(serviceOffer._id);

        await serviceOffer.save();
        await serviceBooking.save();
        await session.commitTransaction();
        session.endSession();
        return res.status(201).json(serviceBooking);
    }catch(error){
        if(session.inTransaction()){
            await session.abortTransaction();
            session.endSession();
        }
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Cancels the booking, which will also cancel the offer and the request
 * @param {serviceBookingId, declineReason, receiverDecline} req.body, where receiverDecline is a boolean indicating if the receiver declined the booking
 * @returns message
 */
export const cancelBooking = async (req, res) => {
    const { serviceBookingId, declineReason, receiverDecline } = req.body;
    try{
        const serviceBooking = await ServiceBooking.findById(serviceBookingId);
        const newReq = { body: { serviceOfferId: serviceBooking.serviceRequest,  declineReason:declineReason, receiverDecline:receiverDecline } };
        return await cancelOffer(newReq, res);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Soley done to set the status of the service booking to completed
 * @param {String} req.body.serviceBookingId
 * @returns ServiceBooking
 */
export const setStatusCompleted = async (req, res) => {
    const { serviceBookingId } = req.body;
    try{
        const serviceBooking = await ServiceBooking.findById(serviceBookingId);
        const serviceOffer = await ServiceOffer.findById(serviceBooking.serviceOffer);
        const serviceRequest = await ServiceRequest.findByIdAndUpdate(serviceOffer.serviceRequest, {serviceStatus: 'Completed'});
        return res.status(201).json(serviceBooking);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

/**
 * NOTE: This would usually include a check, like inplemented in initWorkInProgress, to ensure that the booking is only finalized after the last appointment is done
 * As this would make the presentation nearly impossible, or at least very little dynamic, this is not implemented here
 * We prove that we have the capabilites to do so in initWorkInProgress
 * Finalizes the booking, generates a bill and sends an email to the receiver. Before this is done, the cost are recalculated, so only the happend appointments are billed
 * @param {serviceBookingId, finishedWithoutComplications} req.body, where finishedWithoutComplications is a boolean indicating if the service was finished without 
 * complications (options for further development in customer protection)
 * @returns ServiceBooking
 */
export const finalizeBooking = async (req, res) => {
    const { serviceBookingId, finishedWithoutComplications } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const serviceBookingObject = await ServiceBooking.findById(serviceBookingId);

        if (!serviceBookingObject) {
            if(session.inTransaction()){
                await session.abortTransaction();
                session.endSession();
            }
            return res.status(400).json({ message: `No service booking with the ID ${serviceBookingObject._id} has been found.` });
        }
        serviceBookingObject.finishedWithoutComplications = finishedWithoutComplications;
        serviceBookingObject.finishedDate = Date.now();

        const serviceOfferObject = await ServiceOffer.findById(serviceBookingObject.serviceOffer)
            .populate('viewingConditions')
            .populate('workingConditions');
        const serviceRequestObject = await ServiceRequest.findById(serviceOfferObject.serviceRequest)
            .populate({
                path: 'serviceProvider',
                populate: {
                    path: 'logIn',
                    select: 'email'
                }
            })
            .populate('serviceReceiver', 'firstName');

        await serviceOfferObject.save();

        const { overallCost, overallHours, appointmentsHappened } = await recalcOverallResources(serviceOfferObject._id);
        const {billFileId, invoiceId, status, url} =  await generateBill(serviceBookingObject);

        serviceRequestObject.serviceStatus = 'Payment Pending';
        serviceRequestObject.log.push({status: 'Payment Pending', timestamp: new Date()});
        await serviceRequestObject.save({ session });

        serviceBookingObject.finalHours = overallHours;
        serviceBookingObject.payment.bill = billFileId;
        serviceBookingObject.payment.invoiceUrl = url;
        serviceBookingObject.payment.invoiceId = invoiceId;
        serviceBookingObject.payment.invoiceStatus = status;
        serviceBookingObject.finalOverallCost = overallCost;
        serviceBookingObject.appointmentsHappened = appointmentsHappened;

        await sendEmails("newServiceBooking", {
            receiver: serviceRequestObject.serviceProvider._id,
            companyName: serviceRequestObject.serviceProvider.companyName,
            receiverFirstname: serviceRequestObject.serviceReceiver.firstName,
            email: serviceRequestObject.serviceProvider.logIn.email,
            subject: "New booking confirmed in the Craftify portal "
        })

        await serviceBookingObject.save({ session });
        await serviceOfferObject.save({ session });
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json(serviceBookingObject);
    } catch (error) {
        if(session.inTransaction()){
            await session.abortTransaction();
            session.endSession();
        }
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Retrieve all service bookings
 * @returns The response containing the service bookings or an error message
 */
export const getAll = async (req, res) => {
    try {
        const serviceBookings = await ServiceBooking.find().populate({
            path: 'serviceOffer',
            populate: {
                path: 'serviceRequest'
            }}).populate({
            path: 'serviceOffer',
            populate: {
                path: 'viewingConditions'
            }}).populate({
            path: 'serviceOffer',
            populate: {
                path: 'workingConditions'
            }
        }).populate('payment');
        return res.status(200).json(serviceBookings);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Get all bookings by specific service requests
 * @param {[String]} req.params.requestIds - The IDs of the service requests to retrieve bookings for
 * @returns [ServiceBooking] - The bookings for the given service requests
 */
export const getBookingsByRequests = async (req, res) => {
    try {
        const serviceRequestIds = req.params.requestIds;
        const serviceOffers = await ServiceOffer.find({serviceRequest: { $in: serviceRequestIds }}, '_id');
        const serviceOfferIds = serviceOffers.map(offer => offer._id);
        const serviceBookings = await ServiceBooking.find({serviceOffer: { $in: serviceOfferIds }}).populate({
            path: 'serviceOffer',
            populate: {
                path: 'serviceRequest'
            }}).populate({
            path: 'serviceOffer',
            populate: {
                path: 'viewingConditions'
            }}).populate({
            path: 'serviceOffer',
            populate: {
                path: 'workingConditions'
            }
            }).populate('payment');
        return res.status(200).json(serviceBookings);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Get all bookings by specific service offers
 * @param {[String]} req.params.offerIds - The IDs of the service offers to retrieve bookings for
 * @returns [ServiceBookings] - The bookings for the given service requests
 */
export const getBookingsByOffers = async (req, res) => {
    try {
        const serviceOfferIds = req.params.offerIds;
        const serviceBookings = await ServiceBooking.find({serviceOffer: { $in: serviceOfferIds }}).populate({
            path: 'serviceOffer',
            populate: {
                path: 'serviceRequest'
            }}).populate({
            path: 'serviceOffer',
            populate: {
                path: 'viewingConditions'
            }}).populate({
            path: 'serviceOffer',
            populate: {
                path: 'workingConditions'
            }
            }).populate('payment');
        return res.status(200).json(serviceBookings);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Get all bookings by specific service workers
 * @param {*} req.params.id - The ID of the service booking to retrieve
 * @returns ServiceBooking - The booking for the given ID
 */
export const byId = async (req, res) => {
    try {
        const serviceBooking = await ServiceBooking.findById(req.params.id).populate({
            path: 'serviceOffer',
            populate: {
                path: 'serviceRequest'
            }}).populate({
            path: 'serviceOffer',
            populate: {
                path: 'viewingConditions'
            }}).populate({
            path: 'serviceOffer',
            populate: {
                path: 'workingConditions'
            }
        }).populate('payment');
        if (!serviceBooking) {
            return res.status(404).json({ message: 'Service booking not found' });
        }
        return res.status(200).json(serviceBooking);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Update a service booking
 * @param { serviceBookingId, serviceOffer, hours, materialCost, overallCost, appointmentsHappened, finishedDate, finishedWithoutComplications } req.body - The updated service booking information
 * @returns ServiceBooking - The updated service booking
 */
export const updateBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { serviceBookingId, serviceOffer, hours, materialCost, overallCost, appointmentsHappened, finishedDate, finishedWithoutComplications } = req.body;

        const serviceOfferObject = await ServiceOffer.findById(serviceOffer);
        const serviceRequestObject = await ServiceRequest.findById(serviceOffer.serviceRequest);
        if (!serviceOfferObject || serviceBookingId) {
            if(session.inTransaction()){
                await session.abortTransaction();
                session.endSession();
            }
            return res.status(400).json({ message: 'Booking or Offer could not be identified.' });
        }
        if(['Payment Pending', 'Completed','Cancelled'].includes(serviceRequestObject.serviceStatus)){
            if(session.inTransaction()){
                await session.abortTransaction();
                session.endSession();
            }
            return res.status(500).json({ message: 'This service has already been closed (even though potentially not payed yet). Therefore changes are not possible anymore.' });
        }

        const updatedServiceBooking = await ServiceBooking.findByIdAndUpdate(
            serviceBookingId,
            {
                serviceOffer: serviceOfferObject,
                hours,
                materialCost,
                overallCost,
                appointmentsHappened,
                finishedDate,
                finishedWithoutComplications
            }, {new: true}
        );

        if (!updatedServiceBooking) {
            return res.status(404).json({ message: 'Service booking not found' });
        }
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json(updatedServiceBooking);
    } catch (error) {
        if(session.inTransaction()){
            await session.abortTransaction();
            session.endSession();
        }
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Delete a service booking
 * @param {String} req.params.id  - The ID of the service booking to delete
 * @returns Message - The result of the deletion
 */
export const deleteById = async (req, res) => {
    try {
        const deletedServiceBooking = await ServiceBooking.findByIdAndDelete(req.params.id);
        if (!deletedServiceBooking) {
            return res.status(404).json({ message: 'Service booking not found' });
        }
        return res.status(200).json({ message: 'Service booking deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Generate a bill for a service booking, sends an according email and updates the service booking accordingly
 * @param {ServiceBooking} serviceBookingObject 
 * @returns { billFileId:billFileId, invoiceId:finalizedInvoice.id,  url: finalizedInvoice.hosted_invoice_url, status:finalizedInvoice.status };
 */
const generateBill = async (serviceBookingObject) => {
    try {
        const serviceOffer = await ServiceOffer.findById(serviceBookingObject.serviceOffer)
            .populate('workingConditions')
            .populate('viewingConditions');
        
        if (!serviceOffer) throw new Error("ServiceOffer not found");

        const serviceRequest = await ServiceRequest.findById(serviceOffer.serviceRequest)
            .populate('serviceReceiver serviceProvider');
        
        if (!serviceRequest) throw new Error("ServiceRequest not found");

        const serviceReceiver = await ServiceReceiver.findById(serviceRequest.serviceReceiver).populate('logIn');
        const serviceProvider = await ServiceProvider.findById(serviceRequest.serviceProvider).populate('logIn');
        
        if (!serviceReceiver) throw new Error("ServiceReceiver not found");
        if (!serviceProvider) throw new Error("ServiceProvider not found");

        let allConditions = serviceOffer.workingConditions;
        if (serviceOffer.viewingConditions) {
            allConditions = [serviceOffer.viewingConditions].concat(serviceOffer.workingConditions);
        }

        const customerName = `${serviceRequest.serviceReceiver.firstName} ${serviceRequest.serviceReceiver.lastName}`;
        const customerEmail = serviceReceiver.logIn.email;
        const companyName = serviceProvider.companyName;
        const stripeAccountId = serviceProvider.paymentInformation;
        const receiverId = serviceRequest.serviceReceiver._id;

        const customer = await stripe.customers.create({
            name: customerName,
            email: customerEmail,
        });

        const invoiceItemsPromises = allConditions.map(condition => {
            return stripe.invoiceItems.create({
                customer: customer.id,
                amount: Math.round(condition.expectedOverallCost.toFixed(2)*100),
                currency: 'eur',
                description: `Service on ${condition.date.toDateString()} - ${condition.specialConditions || 'No special conditions'} |||
                      Hourly Rate: ${condition.hourlyRate || 'None'} € - 
                      Material Cost: ${condition.expectedMaterialCost || 'None'} € - 
                      Travel Cost: ${condition.expectedTravelCost.toFixed(2) || 'None'} € - 
                      Additional Cost Factors: ${(condition.expectedAdditionalCostFactors.reduce((acc, factor) => acc + Math.round(factor.price), 0)).toFixed(2) || 'None'} € - 
                      Provisional Sum: ${condition.expectedOverallCost.toFixed(2) || 'None'} €`,
                metadata: {
                    hourlyRate: condition.hourlyRate,
                    materialCost: condition.expectedMaterialCost,
                    travelCost: condition.expectedTravelCost.toFixed(2),
                    additionalCostFactors: (condition.expectedAdditionalCostFactors.reduce((acc, factor) => acc + Math.round(factor.price), 0)).toFixed(2),
                    totalAmount: condition.expectedOverallCost.toFixed(2),
                }
            });
        });

        await Promise.all(invoiceItemsPromises);

        const invoice = await stripe.invoices.create({
            customer: customer.id,
            collection_method: 'send_invoice',
            days_until_due: 30,
            metadata: { stripeAccountId },
        });

        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        const emailOptions = {
            email: customerEmail,
            subject: `Invoice from ${companyName}`,
            message: `Dear ${customerName},\n\nPlease find your invoice at the following link: ${finalizedInvoice.hosted_invoice_url}\n\nThank you for your business!\n\nBest regards,\n${companyName}`,
            companyName: companyName,
            customerName: customerName,
            hosted_invoice_url: finalizedInvoice.hosted_invoice_url,
            receiver: receiverId,
        };

        await sendEmails("BillingTemplate", emailOptions);
        await serviceOffer.save();

        const invoiceDetails = await stripe.invoices.retrieve(finalizedInvoice.id);
        const invoicePdfUrl = invoiceDetails.invoice_pdf;
        const invoicePdf = await downloadPdf(invoicePdfUrl);

        const form = new FormData();
        form.append('file', invoicePdf, `Invoice_${customerName}.pdf`);
        form.append('title', 'Invoice');
        form.append('description', 'Invoice for service on Craftify Platform');

        const response = await axios.post('http://localhost:8080/files/upload', form, { 
            headers: {
                ...form.getHeaders(),
            }
        });

        const billFileId = response.data.fileId;

        return { billFileId:billFileId, invoiceId:finalizedInvoice.id,  url: finalizedInvoice.hosted_invoice_url, status:finalizedInvoice.status };

    } catch (error) {
        console.error('Detailed Error:', error);
        throw new Error('An error occurred');
    }
};

/**
 * Updates the status of an invoice and checks if it is paid.
 * @param {String} req.params.bookingId - The ID of the service booking to check the invoice status for
 * @returns {Object} message, status and if succuess: url of receipt - The status of the invoice
 */
export const checkInvoiceStatus = async (req, res) => {
    const serviceBookingId = req.params.bookingId;
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const serviceBooking = await ServiceBooking.findById(serviceBookingId).populate('payment').session(session);

        if (!serviceBooking || !serviceBooking.payment.invoiceId) {
            throw new Error('No invoice found for this service booking.');
        }

        const invoiceId = serviceBooking.payment.invoiceId;
        const invoice = await stripe.invoices.retrieve(invoiceId);

        if (invoice.status === 'paid') {
            const paymentIntentId = invoice.payment_intent;
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            const charge = await stripe.charges.retrieve(paymentIntent.charges.data[0].id);
            const receiptUrl = charge.receipt_url;

            serviceBooking.payment.receipt = receiptUrl;
            serviceBooking.payment.invoiceStatus = 'paid';
            await serviceBooking.save({ session });

            const serviceOffer = await ServiceOffer.findById(serviceBooking.serviceOffer).session(session);
            const serviceRequest = await ServiceRequest.findById(serviceOffer.serviceRequest).session(session);

            serviceRequest.serviceStatus = 'Completed';
            serviceRequest.log.push({ status: 'Completed', timestamp: new Date() });
            await serviceRequest.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({ message: 'Invoice is paid', status: invoice.status, receiptUrl });
        } else {
            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({ message: 'Invoice is not paid', status: invoice.status, receiptUrl: '' });
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: error.message });
    }
};


/**
 * Downloads a PDF file from a given URL
 * @param {String} url 
 * @returns pdf file as Buffer
 */
async function downloadPdf(url) {
    try{
        
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
        });

        const fileData = Buffer.from(response.data);
        return fileData;

    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
};