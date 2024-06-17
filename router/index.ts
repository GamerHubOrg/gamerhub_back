import { Router } from 'express';
import authenticated from '../middlewares/authenticated';
import configsRoutes from '../modules/configs/configs.routes';
import webhooksRoutes from '../modules/webhooks/webhooks.routes';
import usersRoutes from '../modules/users/users.routes';

const router = Router();

router.use('/configs', configsRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/users', authenticated, usersRoutes);

export default router;