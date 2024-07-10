import { Router } from 'express';
import { GetUsers, PatchUser, GetDashboardStats, BanUser } from './admin.controller';

const router: Router = Router();

router.get('/users', GetUsers);
router.patch('/users/:userId', PatchUser);
router.put('/users/:userId/ban', BanUser);
router.get('/stats/dashboard', GetDashboardStats);

export default router;