import { Router } from 'express';
import { create, getAll, byId, getOfferByConditionId, update, deleteById } from '../controller/serviceConditionsController.js';

const router = Router();

router.post('/create', create);
router.get('/getAll', getAll);
router.get('/byId/:id', byId);
router.get('/OfferByConditionId/:id', getOfferByConditionId);
router.put('/update/:id', update);
router.delete('/delete/:id', deleteById);

export default router;
