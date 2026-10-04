import { Router } from 'express';
import { getAll, getById, getByLastName, getConditionsWithId, create, deleteById, update, finishedOnboarding } from '../controller/serviceReceiverController.js';

const router = Router();

router.get('/getAll', getAll);

router.get('/byId/:id', getById);

router.get('/byLastName/:lastName', getByLastName);

router.get('/condition_by_receiver_id/:id', getConditionsWithId);

router.post('/create', create);

router.delete('/delete/:id', deleteById);

router.put('/update', update);

router.put('/finished_onboarding', finishedOnboarding);

export default router;
