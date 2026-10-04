import {Router} from "express";
import {create, get, getById} from '../controller/analyticController.js'
import { protect } from '../utils/authMiddleware.js';

const router = Router();

router.post('/create', create);

router.get('/get', get);

router.get('/get/:id', getById);

export default router;
