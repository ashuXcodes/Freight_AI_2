import { Router } from 'express';
import { checkPortCompatibility, listPorts } from '../controllers/portCompatibilityController.js';

const router = Router();

router.get('/', listPorts);
router.post('/compatibility', checkPortCompatibility);

export default router;
