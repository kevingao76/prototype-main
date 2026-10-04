import { Router } from 'express';
import { create, getAll, byId, getUserAddress, getUserData, byLastName, update, deleteById } from '../controller/userController.js';
import { protect } from '../utils/authMiddleware.js';
const router = Router();

router.post('/create', create);
router.get('/getAll', getAll);
router.get('/userAddress/:id', protect, getUserAddress);
router.get('/userData/:id', protect, getUserData);
router.get('/byLastName/:lastName', byLastName);
router.get('/byId/:id', byId);
router.put('/update/:id', update);
router.delete('/delete/:id', deleteById);

export default router;