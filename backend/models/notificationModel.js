import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({

    receiver: { type: mongoose.Schema.Types.ObjectId },
    subject: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
