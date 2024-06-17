import { Router } from 'express';
import { GetConfigs } from './configs.controller';

const router: Router = Router();

router.get('/', GetConfigs);

export default router;