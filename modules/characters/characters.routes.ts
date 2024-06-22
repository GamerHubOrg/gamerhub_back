import { Router } from 'express';
import authenticated from '../../middlewares/authenticated'
import isAdmin from '../../middlewares/isAdmin'
import charactersController from './characters.controller';
const {getAllCharacters, getCharacterById, insertCharacter, updateCharacter, deleteCharacter, deleteCharacters} = charactersController;

const router: Router = Router();

router.get('/', authenticated, isAdmin, getAllCharacters);

router.get('/:id', authenticated, isAdmin, getCharacterById);

router.post('/', authenticated, isAdmin, insertCharacter);

router.put('/:id', authenticated, isAdmin, updateCharacter);

router.post('/delete', authenticated, isAdmin, deleteCharacters);

router.delete('/:id', authenticated, isAdmin, deleteCharacter);

export default router;