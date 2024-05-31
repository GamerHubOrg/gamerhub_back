import { Router } from 'express';

const router: Router = Router();

router.get('/keycloak', (req, res) => {
    console.log({wip: 1, text: 'ok'});
    res.sendStatus(200);
});

export default router;