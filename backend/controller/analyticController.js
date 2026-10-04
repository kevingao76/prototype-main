import mongoose from "mongoose";
import {Rating} from "../models/ratingModel.js";
import {Analytic} from "../models/analyticModel.js";
import {ServiceBooking} from "../models/serviceBookingModel.js";
import {ServiceOffer} from "../models/serviceOfferModel.js";
import {ServiceRequest} from "../models/serviceRequestModel.js";
import {ServiceProvider} from "../models/serviceProviderModel.js";

/**
 * Creates a new analytic entry for a service booking along with a rating.
 * This function handles the entire transaction using MongoDB sessions.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.serviceBooking - The ID of the service booking.
 * @param {Object} req.body.rating - The rating object.
 * @param {number} req.body.rating.value - The rating value.
 * @param {string} req.body.rating.content - The content of the rating.
 * @param {Array} req.body.rating.attachments - Attachments for the rating.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} The response containing the new analytic object or an error message.
 */
export const create = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { serviceBookingId, rating } = req.body;

        const serviceBookingObject = await ServiceBooking.findById(serviceBookingId);
        if (serviceBookingObject.hasOwnProperty('analytics')) {
            throw new Error("Analytic already exists for this service booking.");
        }
        const serviceOfferObject = await ServiceOffer.findById(serviceBookingObject.serviceOffer);
        const serviceRequestObject = await ServiceRequest.findById(serviceOfferObject.serviceRequest);
        const serviceProvider = await ServiceProvider.findById(serviceRequestObject.serviceProvider);

        const newRating = await Rating.create([{
            value: rating.value,
            content: rating.content,
            attachments: rating.attachments,
        }], { session });

        const isEdited = serviceOfferObject.hasBeenEdited;
        
        const log = serviceRequestObject.log;
        const timeBetweenRequestAndFirst = Math.round(timeBetweenTwoStatuses(log, "Request Sent", "Offer Sent"));
        const timeBetweenRequestAndLast = Math.round(timeBetweenTwoStatuses(log, "Request Sent", "Payment Pending"));

        let newAnalytic = {}
        if(isEdited) {
            const differenceBetweenInitialAndFinalCost = Math.round(serviceOfferObject.expectedOverallCost - serviceOfferObject.initialExpectedCost);
        
            newAnalytic = await Analytic.create([{
                serviceBooking: serviceBookingObject._id,
                timeBetweenRequestAndFirst: timeBetweenRequestAndFirst,
                timeBetweenRequestAndLast: timeBetweenRequestAndLast,
                differenceBetweenInitialAndFinalCost: differenceBetweenInitialAndFinalCost,
                rating: newRating[0]._id,
            }], { session });
        }else{
            newAnalytic = await Analytic.create([{
                serviceBooking: serviceBookingObject._id,
                timeBetweenRequestAndFirst: timeBetweenRequestAndFirst,
                timeBetweenRequestAndLast: timeBetweenRequestAndLast,
                rating: newRating[0]._id,
            }], { session });
        }

        serviceProvider.analytics.push(newAnalytic[0]);
        await serviceProvider.save({ session });

        serviceBookingObject.analytics = newAnalytic[0]._id;
        await serviceBookingObject.save({ session });

        await session.commitTransaction();
        session.endSession();
        return res.status(201).json(newAnalytic[0]);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Retrieves all analytics.
 * @returns {Promise<void>} The response containing the analytics or an
 */
export const get = async (req, res) => {
    try {
        const analytics = await Analytic.find().populate("rating");
        return res.status(200).json(analytics);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
};

/**
 * Retrieves an analytic by ID.
 * @returns {Promise<void>} The response containing the analytic or an error message.
 */
export const getById = async (req, res) => {
    try {
        const analytic = await Analytic.findById(req.params.id).populate("rating");
        return res.status(200).json(analytic);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
};

/**
 * Retrieves time between two statuses.
 * @param {[{status,timestamp}]} log of the service request
 * @param {String} status1 Beginning Status
 * @param {String} status2 Ending Status
 * @returns 
 */
const timeBetweenTwoStatuses = (log, status1, status2) => {
    let first = log.find(entry => entry.status === status1);
    let last = log.find(entry => entry.status === status2);
    let differenceInMilliseconds = last.timestamp - first.timestamp;
    let differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
    return differenceInHours;
};