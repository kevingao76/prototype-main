import { Router } from 'express';
import { createEmptyBooking, agree, adjustConditionsOfService, initWorkInProgress, cancelBooking, finalizeBooking, checkInvoiceStatus, 
    getAll, byId, getBookingsByRequests, getBookingsByOffers,updateBooking, deleteById, setStatusCompleted } from '../controller/serviceBookingController.js';

const router = Router();

router.post('/create', createEmptyBooking);

router.put('/agree', agree);

router.put('/adjustConditions', adjustConditionsOfService);

router.put('/setWorkInProgress', initWorkInProgress);

router.put('/cancel', cancelBooking);

router.put('/finalize', finalizeBooking);

router.get('/checkInvoiceStatus/:bookingId', checkInvoiceStatus);

router.get('/getAll', getAll);

router.get('/byId/:id', byId);

router.get('/getBookingsByRequests/:requestIds', getBookingsByRequests);

router.get('/getBookingsByOffers/:offerIds', getBookingsByOffers);

router.put('/update/:id', updateBooking);

router.put('/setCompleted', setStatusCompleted);

router.delete('/delete/:id', deleteById);

export default router;
