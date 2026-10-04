import { Router } from 'express';
import { getAll, getByTitle, getByTitles } from '../controller/serviceTypeController.js';

const router = Router();

router.get('/getAll', getAll);

router.get('/getByTitle/:title', getByTitle);

router.get('/getByTitles/:titles', getByTitles);

export default router;