import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const logInSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: {type: Boolean, default: false },
    verificationToken: {type: String},
    isServiceProvider: {type: Boolean, default:false }
});

logInSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

logInSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

logInSchema.methods.generateVerificationToken = function () {
    const verificationToken = crypto.randomBytes(20).toString('hex');
    this.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    return verificationToken;
};

const LogIn = mongoose.model("LogIn", logInSchema);

export default LogIn;