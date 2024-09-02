import {Router} from 'express';
import authenticated from '../../middlewares/authenticated';
import {FriendDemand} from "./friendsRelations.controller";

const router: Router = Router();

router.post('/confirmRelation', authenticated);
router.post('/askFriend', authenticated, FriendDemand);
router.get('/deleteFriend', authenticated);
router.post('/blockFriend', authenticated);
router.get('/refuseFriend', authenticated);

export default router;
