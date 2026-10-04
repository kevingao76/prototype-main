import express from "express";
import mongoose from "mongoose";
import { ServiceWorker } from "../models/serviceWorkerModel.js";
import LogIn from "../models/logInModel.js";

export const getAll = async (req, res) => {
    try {
        let serviceWorkers = await ServiceWorker.find();
        return res.status(200).send(serviceWorkers);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};

export const byId = async (req, res) => {
    try {
        const { id } = req.params;
        let serviceWorker = await ServiceWorker.findById(id);
        if (!serviceWorker) {
            return res.status(404).send({ error: "ServiceWorker not found" });
        }
        let email = await LogIn.findById(serviceWorker.logIn).select('email');
        return res.status(200).send({ "serviceWorker": serviceWorker, "email": email });
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};

export const byLastName = async (req, res) => {
    try {
        const { lastName } = req.params;
        let serviceWorkers = await ServiceWorker.where({ lastName: lastName });
        let emails = await Promise.all(serviceWorkers.map(async (sw) => {
            let email = await LogIn.findById(sw.logIn).select('email');
            return { "serviceWorker": sw, "email": email };
        }));
        return res.status(200).send(emails);
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
};

export const create = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { firstName, lastName, phoneNumber, email, password, skills, proofOfSkills, company, serviceRadius, privateCalendar } = req.body;

        const newLogIn = await LogIn.create({ email, password });
        const newServiceWorker = await ServiceWorker.create({
            firstName,
            lastName,
            logIn: newLogIn._id,
            phoneNumber,
            skills,
            proofOfSkills,
            company,
            serviceRadius,
            privateCalendar
        });

        await session.commitTransaction();
        session.endSession();
        return res.status(200).send(newServiceWorker);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ error: error.message });
    }
};

export const deleteById = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const serviceWorker = await ServiceWorker.findById(id).session(session);
        if (!serviceWorker) {
            throw new Error('ServiceWorker not found');
        }

        const logInId = serviceWorker.logIn;
        await ServiceWorker.findByIdAndDelete(id).session(session);
        await LogIn.findByIdAndDelete(logInId).session(session);
        await session.commitTransaction();
        session.endSession();
        return res.status(200).send({ message: 'ServiceWorker and related login deleted successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ error: error.message });
    }
};

export const update = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let serviceWorker = await ServiceWorker.findById(req.body._id);
        let login = await LogIn.findById(serviceWorker.logIn);
        if (!serviceWorker) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send("ServiceWorker not found");
        }

        const fieldsToUpdate = ['firstName', 'lastName', 'phoneNumber', 'skills', 'proofOfSkills', 'company', 'serviceRadius', 'privateCalendar'];

        fieldsToUpdate.forEach(field => {
            if (req.body[field]) {
                serviceWorker[field] = req.body[field];
            }
        });

        const logInfieldsToUpdate = ['email', 'password', 'tfa'];

        logInfieldsToUpdate.forEach(field => {
            if (req.body[field]) {
                login[field] = req.body[field];
            }
        });

        await serviceWorker.save();
        await login.save();

        await session.commitTransaction();
        session.endSession();

        return res.status(200).send({ message: 'ServiceWorker updated successfully' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).send({ error: error.message });
    }
};