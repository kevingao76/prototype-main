import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";

export const sendNotification = async (req, res) => {
    const { receiver, content, subject } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const newNotification = await Notification.create({
            receiver: receiver,
            content: content,
            subject: subject,
        });
        await session.commitTransaction();
        await session.endSession();
        res.status(201).json(newNotification);
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        res.status(500).json({ message: error.message });
    }
};

export const getNotifications = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const myNotifications = await Notification.find({ receiver: req.params.id }).exec();
        res.status(200).json(myNotifications);
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        res.status(500).json({ message: error.message });
    }
    /*
    try {
        // Fetch messages sent by the user
        const myMessages = await Message.find({ sender: sender, receiver: receiver }).exec();
        // Fetch messages received by the user (sent by the other person)
        const otherPersonMessages = await Message.find({ sender: receiver, receiver: sender }).exec();

        // Merge the messages
        const allMessages = [
            ...myMessages.map(message => ({ ...message.toObject(), isMyMessage: true })),
            ...otherPersonMessages.map(message => ({ ...message.toObject(), isMyMessage: false }))
        ];

        // Sort messages by timestamp
        const messagesInOrder = allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        await session.commitTransaction();
        await session.endSession();
        res.status(200).json(messagesInOrder);
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        res.status(500).json({ message: error.message });
    }

         */
};
