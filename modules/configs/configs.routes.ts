import { Router } from 'express';
import { GetConfigs, PostConfig } from './configs.controller';
import authenticated from '../../middlewares/authenticated'
import cache from '../../middlewares/cache'

const router: Router = Router();

router.get('/', cache, GetConfigs);

router.post('/', authenticated, PostConfig);

export default router;