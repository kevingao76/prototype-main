import { ServiceConditions } from '../models/serviceConditionsModel.js';
import { ServiceOffer } from '../models/serviceOfferModel.js';
import { ServiceRequest } from '../models/serviceRequestModel.js';
import { ServiceProvider } from '../models/serviceProviderModel.js';
import mongoose from 'mongoose';
import { recalcOverallResources } from './serviceOfferController.js';
import { populate } from 'dotenv';

/**
 * Create a new service condition
 * @param {serviceOfferId, hourlyRate, date, expectedDuration, expectedMaterialCost, expectedAdditionalCostFactors, specialConditions} req.body All elements needed to create a new service condition
 * @returns New service condition
 */
export const create = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { serviceOfferId, hourlyRate, date, expectedDuration, expectedMaterialCost, expectedAdditionalCostFactors, specialConditions } = req.body;
        
        const serviceOffer = await ServiceOffer.findById(serviceOfferId);
        const serviceRequest = await ServiceRequest.findById(serviceOffer.serviceRequest);
        const serviceProvider = await ServiceProvider.findById(serviceRequest.serviceProvider);

        const expectedWorkCost = parseFloat(hourlyRate) * (parseFloat(expectedDuration) / 60);
        let newExpectedTravelCost = 0;

        if (!isNaN(parseFloat(serviceProvider.travelKilometerConstant)) && !isNaN(parseFloat(serviceRequest.distance))) {
            newExpectedTravelCost = parseFloat(serviceProvider.travelKilometerConstant) * (parseFloat(serviceRequest.distance) / 1000);
        } else {
            return res.status(400).json({ message: 'Please set a valid number for the cost per traveled kilometer and distance, so we can help you estimate your costs.' });
        }

        let newExpectedAdditionalCost = 0;
        let newExpectedAdditionalCostFactors = [];
        expectedAdditionalCostFactors.forEach((element) => {
            let price = parseFloat(element.price);
            newExpectedAdditionalCost += price;
            newExpectedAdditionalCostFactors.push({ description: element.description, price: price.toFixed(2) });
        });

        let newExpectedOverallCost = 0;

        if (!isNaN(expectedWorkCost) && 
            !isNaN(newExpectedTravelCost) && 
            !isNaN(newExpectedAdditionalCost) && 
            !isNaN(parseFloat(expectedMaterialCost))) {
            
            newExpectedOverallCost = expectedWorkCost + newExpectedTravelCost + newExpectedAdditionalCost + parseFloat(expectedMaterialCost);
        } else {
            return res.status(400).json({ message: 'Please ensure all cost components are valid numbers.' });
        }

        const formattedExpectedMaterialCost = parseFloat(expectedMaterialCost).toFixed(2);
        const formattedHourlyRate = parseFloat(hourlyRate).toFixed(2);

        const newServiceCondition = await ServiceConditions.create({
            serviceOffer: serviceOffer._id,
            hourlyRate: formattedHourlyRate,
            date: date,
            expectedDuration: expectedDuration,
            expectedMaterialCost: formattedExpectedMaterialCost,
            expectedAdditionalCostFactors: newExpectedAdditionalCostFactors,
            expectedTravelCost: newExpectedTravelCost.toFixed(2),
            expectedOverallCost: newExpectedOverallCost.toFixed(2),
            specialConditions: specialConditions
        });

        await session.commitTransaction();
        session.endSession();
        return res.status(201).json(newServiceCondition);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: error.message });
    }
};


/**
 * Retrieve all service conditions
 * @returns All service conditions
 */
export const getAll = async (req, res) => {
    try {
        const serviceConditions = await ServiceConditions.find();
        return res.status(200).json(serviceConditions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Retrieve all service conditions by service offer ID
 * @param {String} req.params.id
 * @returns serviceCondition
 */
export const byId = async (req, res) => {
    try {
        const serviceCondition = await ServiceConditions.findById(req.params.id);
        if (!serviceCondition) {
            return res.status(404).json({ message: 'Service Condition not found' });
        }
        return res.status(200).json(serviceCondition);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Updates a service condition
 * @param {serviceConditionId, hourlyRate, date, expectedDuration, expectedMaterialCost, expectedAdditionalCostFactors} req.body All elements needed to update a service condition 
 * @returns Updated service condition
 */
export const update = async (req, res) => {
    const { serviceConditionId, hourlyRate, date, expectedDuration, expectedMaterialCost, expectedAdditionalCostFactors, specialConditions } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const serviceCondition = await ServiceConditions.findById(serviceConditionId);
        if (!serviceCondition) {
            throw new Error(`No service condition with the id ${serviceConditionId} found`);
        }

        const serviceOffer = await ServiceOffer.findById(serviceCondition.serviceOffer)
            .populate({
                path: 'serviceRequest',
                populate: { path: 'serviceProvider' }
            })
            .populate('viewingConditions')
            .populate('workingConditions');

        if (!serviceOffer || !serviceOffer.serviceRequest || !serviceOffer.serviceRequest.serviceProvider) {
            throw new Error(`No service offer with the id ${serviceCondition.serviceOffer} found`);
        }

        serviceCondition.hourlyRate = hourlyRate;
        serviceCondition.date = date;
        serviceCondition.expectedDuration = expectedDuration;
        serviceCondition.expectedMaterialCost = expectedMaterialCost;
        serviceCondition.expectedAdditionalCostFactors = expectedAdditionalCostFactors;
        serviceCondition.specialConditions = specialConditions;
        await serviceCondition.save();

        //await calculateOverallCost(serviceCondition, serviceProvider.travelKilometerConstant, serviceRequest.distance);
        await recalcOverallResources(serviceOffer._id);

        await session.commitTransaction();
        session.endSession();
        return res.status(200).json(serviceCondition);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Delete a service condition by ID
 * @param {String} req.params.id ID of the service condition to be deleted
 * @returns message
 */
export const deleteById = async (req, res) => {
    try {
        const deletedServiceCondition = await ServiceConditions.findByIdAndDelete(req.params.id);
        if (!deletedServiceCondition) {
            return res.status(404).json({ message: 'Service Condition not found' });
        }
        return res.status(200).json({ message: 'Service Condition deleted' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


/**
 * Calculate the overall cost of a service condition and saves them to the service condition
 * @param {ServiceCondition} condition with all necessary information to calculate the overall cost of a service condition
 * @returns { overallCost, overallHours }
 */
export const calculateOverallCost = async (condition, travelKilometerConstant, distance) => {
    const expectedWorkCost = condition.hourlyRate * (condition.expectedDuration / 60);
    const hours = condition.expectedDuration / 60;
    let newExpectedTravelCost = 0;
    if (travelKilometerConstant) {
        newExpectedTravelCost = travelKilometerConstant/1000 * distance;
    } else {
        throw Error('Please set a value for the cost per traveled kilometer, so we can help you estimate your costs.');
    }

    let newExpectedAdditionalCost = 0;
    let newExpectedAdditionalCostFactors = [];
    condition.expectedAdditionalCostFactors.forEach((factor) => {
        newExpectedAdditionalCost += parseFloat(factor.price);
        newExpectedAdditionalCostFactors.push({ description: factor.description, price: factor.price });
    });
    const cost = parseFloat(expectedWorkCost + newExpectedTravelCost + newExpectedAdditionalCost + condition.expectedMaterialCost);
    condition.expectedTravelCost = parseFloat(newExpectedTravelCost.toFixed(2));
    condition.expectedOverallCost = parseFloat(cost.toFixed(2));

    await condition.save();

    return { cost: cost, hours: hours };
};


/**
 * Retrieves a service offer by a service condition ID
 * @param {*} req 
 * @returns ServiceOffer
 */
export const getOfferByConditionId = async (req, res) => {
    try {
        const serviceCondition = await ServiceConditions.findById(req.params.id);
        if (!serviceCondition) {
            return res.status(404).json({ message: 'Service Condition not found' });
        }
        const serviceOffer = await ServiceOffer.findById(serviceCondition.serviceOffer).populate({
            path: 'serviceRequest',
            populate: {
                path: 'serviceProvider',
                populate: {
                    path: 'address'
                }
            }}).populate({
            path: 'serviceRequest',
            populate: {
                path: 'serviceReceiver',
                populate: {
                    path: 'address'
                }
            }
        });
        if (!serviceOffer) {
            return res.status(404).json({ message: 'Service Offer not found' });
        }
        return res.status(200).json(serviceOffer);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
