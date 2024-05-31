import { Router } from 'express';
import authenticated from '../middlewares/authenticated';
import gamesRoutes from '../modules/games/games.routes';
import webhooksRoutes from '../modules/webhooks/webhooks.routes';
import configsRoutes from '../modules/configs/configs.routes';

const router = Router();

router.use('/games', authenticated, gamesRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/configs', configsRoutes);

export default router;