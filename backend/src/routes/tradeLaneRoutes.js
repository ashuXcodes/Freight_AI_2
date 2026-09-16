import { Router } from 'express';
import { listAvailableTradeLanes, lookupTradeLane } from '../controllers/tradeLaneController.js';

const router = Router();

router.get('/', listAvailableTradeLanes);
router.get('/lookup', lookupTradeLane);

export default router;
