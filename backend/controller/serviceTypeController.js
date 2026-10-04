import express from "express";
import mongoose from "mongoose";
import {ServiceType} from "../models/serviceTypeModel.js";
import {SubServiceType} from "../models/subServiceTypeModel.js";
import serviceCatalogData from "../data/serviceCatalogData.json" with {type: 'json'};

const router = express.Router();

/**
 * Retrieves all service types
 * @returns all service types
 */
export const getAll = async (req, res) => {
    try {
        let serviceTypes = await ServiceType.find().populate('subServices');
        return res.status(200).send(serviceTypes);
    } catch (error) {
        return res.status(400).send({error: error.message});
    }
};

/**
 * Retrieves all service types by their titles
 * @param {[String]} req.params.titles - service type titles
 * @returns {ServiceType[]} service types
 */
export const getByTitles = async (req, res) => {
    try {
        const serviceTypeIds = req.params.titles.split(',');
        let serviceTypes = []
        for(const id of serviceTypeIds){
            console.log(id);
            serviceTypes.push(await ServiceType.findById(id).populate('subServices'));
        }
        
        console.log(`serviceTypes ${serviceTypes}`);
        return res.status(200).send(serviceTypes);
    } catch (error) {
        return res.status(400).send({error: error.message});
    }
};

/**
 * Retrieve a service type by its title
 * @param {String} req.params.title - service type title
 * @returns ServiceType
 */
export const getByTitle = async (req, res) => {
    try {
        let serviceTypes = await ServiceType.findOne(req.params).populate('subServices');
        return res.status(200).send(serviceTypes);
    } catch (error) {
        return res.status(400).send({error: error.message});
    }
};

/**
 * Initializes the database with the service catalog data.
 * It is important to note that this function will remove all existing data from the database.
 * Additionally it is relevant, that the IDs of the service types and sub service types, MUST be their names (subServiceType is ServiceType.title + SubServiceType.name).
 * Only like this, the deletion and creation of the service catalog data will cause no issues, when referencing the service types and sub service types in other collections.
 */
export const init = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Cleanup existing data
        await ServiceType.deleteMany({});
        await SubServiceType.deleteMany({});

        for (const serviceType of serviceCatalogData.servicesData) {
            const createdServiceType = await ServiceType.create(
                {
                    image: serviceType.image,
                    title: serviceType.title,
                    description: serviceType.description,
                    link: serviceType.link,
                }
            );
            for (const subServiceType of serviceType.subServices) {
                let newOptionValues = [];
                subServiceType.optionValues.forEach(element => {
                    newOptionValues.push(String(element))
                });
                const createdSubServiceType = await SubServiceType.create(
                    {
                        serviceTypeParent: createdServiceType._id,
                        name: subServiceType.name,
                        description: subServiceType.description,
                        optionName: subServiceType.optionName,
                        optionValues: newOptionValues
                    }
                );

                await createdServiceType.subServices.push(createdSubServiceType._id);
                await createdServiceType.save();
            }
        }
        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        // Handle errors
        await session.abortTransaction();
        session.endSession();
        console.error("Error during initialization:", error);
    }
};


export default router;
