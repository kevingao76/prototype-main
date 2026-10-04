import { Router } from 'express';
import { create, finalize, getAll, byId, update, deleteById, cancelRequest } from '../controller/serviceRequestController.js';

const router = Router();

router.post('/create', create);
router.post('/finalize', finalize);
router.get('/getAll', getAll);
router.put('/cancel', cancelRequest);
router.get('/byId/:id', byId);
router.put('/update/:id', update);
router.delete('/delete/:id', deleteById);

export default router;
