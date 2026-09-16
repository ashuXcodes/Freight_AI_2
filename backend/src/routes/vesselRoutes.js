import { Router } from 'express';
import { listVesselTypes, recommendVessels } from '../controllers/vesselController.js';

const router = Router();

router.get('/', listVesselTypes);
router.post('/recommend', recommendVessels);

export default router;
