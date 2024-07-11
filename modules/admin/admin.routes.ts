import { Router } from 'express';
import { GetUsers, PatchUser, GetDashboardStats, GetBanishments, BanUser, DeleteBanishment } from './admin.controller';

const router: Router = Router();

router.get('/users', GetUsers);
router.get('/banishments', GetBanishments);
router.delete('/banishments/:banishmentId', DeleteBanishment);
router.patch('/users/:userId', PatchUser);
router.put('/users/:userId/ban', BanUser);
router.get('/stats/dashboard', GetDashboardStats);

export default router;