import { Router } from 'express';
import { GetUsers, PatchUser, GetDashboardStats } from './admin.controller';

const router: Router = Router();

router.get('/users', GetUsers);
router.patch('/users/:userId', PatchUser);
router.get('/stats/dashboard', GetDashboardStats);

export default router;