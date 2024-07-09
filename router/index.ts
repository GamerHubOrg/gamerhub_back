import { Router } from 'express';
import authenticated from '../middlewares/authenticated';
import isAdmin from '../middlewares/isAdmin';
import configsRoutes from '../modules/configs/configs.routes';
import usersRoutes from '../modules/users/users.routes';
import fetcherRoutes from "../modules/fetcher/fetcher.routes";
import characterRoutes from "../modules/characters/characters.routes";
import subscriptionsRoutes from "../modules/subscriptions/subscriptions.routes";
import gameRecordsRoutes from "../modules/gameRecords/gameRecords.routes";
import adminRoutes from '../modules/admin/admin.routes';

const router = Router();

router.use('/configs', configsRoutes);
router.use('/users', usersRoutes);
router.use("/fetcher", fetcherRoutes);
router.use("/characters", characterRoutes);
router.use("/subscriptions", subscriptionsRoutes);
router.use("/gameRecords", gameRecordsRoutes);
router.use("/admin", authenticated, isAdmin, adminRoutes);

export default router;
