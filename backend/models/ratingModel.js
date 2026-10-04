import mongoose, { Schema } from "mongoose";

const ratingSchema = new Schema({
    value: { type: Number, required: true },
    content: { type: String },
    attachments: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'upload.files'
    },
});

export const Rating = mongoose.model('Rating', ratingSchema);
