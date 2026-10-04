import { Router } from 'express';
import { getAll, getWithConditions, byId, byCompanyName, getConditionsWithId,create, deleteById, update, finishedOnboarding, importGoogleCalendar} from '../controller/serviceProviderController.js';

const router = Router();

router.get('/getAll', getAll);

router.get('/getWithConditions/:subServiceId/:location', getWithConditions);

router.get('/byId/:id', byId);

router.get('/byCompanyName/:companyName', byCompanyName);

router.get('/condition_by_provider_id/:id', getConditionsWithId);

router.post('/create', create);

router.delete('/delete/:id', deleteById);

router.put('/update', update);

router.put('/finished_onboarding', finishedOnboarding);

router.put('/importCalendar', importGoogleCalendar);

export default router;
