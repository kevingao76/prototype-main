import { Router } from 'express';
import { getAll, byId, byLastName, create, deleteById, update } from '../controller/serviceWorkerController.js';

const router = Router();

router.get('/getAll', getAll);

router.get('/byId/:id', byId);

router.get('/byLastName/:lastName', byLastName);

router.post('/create', create);

router.delete('/delete/:id', deleteById);

router.put('/update', update);

export default router;