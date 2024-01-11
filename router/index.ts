import { Router } from 'express';
import authenticated from '../middlewares/authenticated';
import gamesRoutes from '../modules/games/games.routes';

const router = Router();

router.use('/games', authenticated, gamesRoutes);

export default router;