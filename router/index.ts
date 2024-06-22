import { Router } from 'express';
import configsRoutes from '../modules/configs/configs.routes';
import usersRoutes from '../modules/users/users.routes';
import fetcherRoutes from "../modules/fetcher/fetcher.routes";
import characterRoutes from "../modules/characters/characters.routes"

const router = Router();

router.use('/configs', configsRoutes);
router.use('/users', usersRoutes);
router.use("/fetcher", fetcherRoutes);
router.use("/characters", characterRoutes);

export default router;
