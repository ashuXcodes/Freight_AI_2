import { Router } from 'express';
import { lookupFreightMarket } from '../controllers/freightMarketController.js';

const router = Router();
router.get('/lookup', lookupFreightMarket);

export default router;
