// models/serviceType.js
const ServiceStatus = Object.freeze({
    REQUEST_INITIATED: 'Request Initiated',
    REQUEST_SENT: 'Request Sent',
    OFFER_INITIATED: 'Offer Filled',
    OFFER_SENT: 'Offer Sent',
    JOB_AGREED: 'Job Agreed',
    WORK_IN_PROGRESS: 'Work in Progress',
    PAYMENT_PENDING: 'Payment Pending',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
});

export default ServiceStatus;