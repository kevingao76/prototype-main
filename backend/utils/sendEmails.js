import dotenv from 'dotenv';
import sendgrid from '@sendgrid/mail';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Notification from "../models/notificationModel.js";

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const sendEmails = async (template, options) => {
    const sgMail = sendgrid;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    console.log(`Send emails called with options: ${JSON.stringify(options)}`);
    let msg = {};
    switch(template) {
        case "eMailVerificationTemplate":
            const emailTemplatePath = path.join(__dirname, '../mailTemplates/eMailVerificationTemplate.html');
            const emailHtmlTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
            const emailHtmlContent = emailHtmlTemplate
                .replace('{{name}}', options.name)
                .replace('{{verificationUrl}}', options.verificationUrl);
            msg = setMessage(emailHtmlContent);
            sendMessage(msg);
            break;
        case "BillingTemplate":
            const billTemplatePath = path.join(__dirname, '../mailTemplates/billTemplate.html');
            const billHtmlTemplate = fs.readFileSync(billTemplatePath, 'utf-8');
            const billHtmlContent = billHtmlTemplate
                .replace(/{{companyName}}/g, options.companyName)
                .replace('{{customerName}}', options.customerName)
                .replace('{{hosted_invoice_url}}', options.hosted_invoice_url)
                .replace('{{verificationUrl}}', options.verificationUrl);
            msg = setMessage(billHtmlContent);
            sendMessage(msg);
            break;
        case "newServiceRequest":
            const requestTemplatePath = path.join(__dirname, '../mailTemplates/newServiceRequest.html');
            const requestHtmlTemplate = fs.readFileSync(requestTemplatePath, 'utf-8');
            const requestHtmlContent = requestHtmlTemplate
                .replace(/{{receiverFirstname}}/g, options.receiverFirstname)
                .replace(/{{companyName}}/g, options.companyName)
            msg = setMessage(requestHtmlContent);
            sendMessage(msg);
            break;
        case "newServiceOffer":
            const offerTemplatePath = path.join(__dirname, '../mailTemplates/newServiceOffer.html');
            const offerHtmlTemplate = fs.readFileSync(offerTemplatePath, 'utf-8');
            const offerHtmlContent = offerHtmlTemplate
                .replace(/{{companyName}}/g, options.companyName)
                .replace('{{receiverFirstname}}', options.receiverFirstname)
            msg = setMessage(offerHtmlContent);
            sendMessage(msg);
            break;
        case "newServiceBooking":
            const bookingTemplatePath = path.join(__dirname, '../mailTemplates/newServiceBooking.html');
            const bookingHtmlTemplate = fs.readFileSync(bookingTemplatePath, 'utf-8');
            const bookingHtmlContent = bookingHtmlTemplate
                .replace(/{{receiverFirstname}}/g, options.receiverFirstname)
                .replace(/{{companyName}}/g, options.companyName)
            msg = setMessage(bookingHtmlContent);
            sendMessage(msg);
            break;
        default:
    }

    function setMessage(htmlContent) {
        const msg = {
            to: options.email,
            from: 'sebacraftify@gmail.com',
            subject: options.subject,
            text: options.message,
            html: htmlContent,
        };
        return msg;
    }

    function sendMessage(msg) {
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent');
            })
            .catch((error) => {
                console.error(error);
            });
        Notification.create({
            receiver: options.receiver,
            content: msg.html,
            subject: msg.subject,
        })
    }
};

export default sendEmails;
