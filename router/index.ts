import { Router } from 'express';
import configsRoutes from '../modules/configs/configs.routes';
import usersRoutes from '../modules/users/users.routes';

const router = Router();

router.use('/configs', configsRoutes);
router.use('/users', usersRoutes);

export default router;