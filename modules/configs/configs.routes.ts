import { Router } from 'express';
import { GetConfigs, PostConfig } from './configs.controller';
import authenticated from '../../middlewares/authenticated'

const router: Router = Router();

router.get('/', GetConfigs);

router.post('/', authenticated, PostConfig);

export default router;