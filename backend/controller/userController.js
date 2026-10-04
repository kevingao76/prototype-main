import express from "express";
import mongoose from "mongoose";
import {User} from "../models/userModel.js";
import LogIn from "../models/logInModel.js";
import { protect } from '../utils/authMiddleware.js';
import Address from "../models/addressModel.js";

const router = express.Router();

export const getAll = async (req, res)=>{
    try{
        let users = await User.find(undefined, undefined, undefined);
        return res.status(200).send(users);
    }catch(error){
        return res.status(400).send( {error: error.message} );
    }
};

export const byId = async (req, res)=>{
    try{
        const {id} = req.params;
        let user = await User.findById(id, undefined, undefined);
        let email = await LogIn.findById(user._id).email;
        return res.status(200).send({"user":user,"email":email});
    }catch(error){
        return res.status(400).send( {error: error.message} );
    }
};

export const getUserAddress = async (req, res)=>{
    try{
        const {loginID} = req.params;
        let user = await User.findOne({loginID});
        const {addressID} = user.address;
        let address = await Address.findOne({addressID})
        return res.status(200).send({"address":address});
    }catch(error){
        return res.status(400).send( {error: error.message} );
    }
};

export const getUserData = async (req, res)=>{
    try{
        const {loginID} = req.params;
        let user = await User.findOne({loginID});
        return res.status(200).send({"user":user});
    }catch(error){
        return res.status(400).send( {error: error.message} );
    }
};

export const byLastName = async (req, res)=>{
    try{
        const {lastName} = req.params;
        let user = await User.where({lastName: lastName});
        let email = await LogIn.findById(user._id).email;
        return res.status(200).send({"user":user,"email":email});
    }catch(error){
        return res.status(400).send( {error: error.message} );
    }
};

export const create = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { firstName, lastName, phoneNumber } = req.body;
        const newLogIn = await LogIn.create({email: req.body.email, password: req.body.password});
        const newUser = await User.create({
                firstName,
                lastName,
                logIn: newLogIn._id,
                phoneNumber
        });
        await session.commitTransaction();
        session.endSession();
        return res.status(200).send(newUser);

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
        const userId = req.params.id;
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error('User not found');
        }

        const logInId = user.logIn;
        await User.findByIdAndDelete(userId).session(session);
        await LogIn.findByIdAndDelete(logInId).session(session);
        await session.commitTransaction();
        await session.endSession();

        return res.status(200).send({ message: 'User and related login deleted successfully' });

    } catch (error) {
        await session.abortTransaction();
        await session.endSession();

        return res.status(400).send({ error: error.message });
    }
};

export const update = async (req, res)=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        let user = await User.findById(req.body._id);
        let login = await LogIn.findById(user.logIn);
        if (!user){
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send("User not found");
        }

        const fieldsToUpdate = ['firstName', 'lastName', 'phoneNumber', 'hasEnabledAds'];

        fieldsToUpdate.forEach(field => {
            if (req.body[field]) {
                user[field] = req.body[field];
            }
        });

        const logInfieldsToUpdate = ['email', 'password', 'tfa'];

        logInfieldsToUpdate.forEach(field => {
            if (req.body[field]) {
                login[field] = req.body[field];
            }
        });

        await user.save();
        await login.save();

        await session.commitTransaction();
        session.endSession();

        return res.status(200).send({ message: 'User updated successfully' });
    }catch(error){
        await session.abortTransaction();
        session.endSession();

        return res.status(400).send( {error: error.message} );
    }
};


export default router;