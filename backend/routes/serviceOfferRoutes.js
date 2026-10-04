import { Router } from 'express';
import { createEmptyOffer, fill, addConditions, removeConditions, finalize, getAll, getOffersByRequests, byId, update, cancelOffer, deleteById } from '../controller/serviceOfferController.js';


const router = Router();

router.post('/createEmpty', createEmptyOffer);

router.put('/fill', fill);

router.put('/addConditions', addConditions);

router.put('/removeConditions', removeConditions);

router.post('/finalize', finalize);

router.put('/cancel', cancelOffer);

router.get('/getAll', getAll);

router.get('/getOffersByRequests/:requestIds', getOffersByRequests);

router.get('/byId/:id', byId);

router.put('/update/:id', update);

router.delete('/delete/:id', deleteById);

export default router;
