import { Router } from 'express';
import authenticated from '../../middlewares/authenticated'
import charactersController from './characters.controller';
const {getAllCharacters, getCharacterById, insertCharacter, updateCharacter, deleteCharacter, deleteCharacters} = charactersController;

const router: Router = Router();

router.get('/', getAllCharacters);

router.get('/:id', getCharacterById);

router.post('/', authenticated, insertCharacter);

router.put('/:id', authenticated, updateCharacter);

router.post('/delete', authenticated, deleteCharacters);

router.delete('/:id', authenticated, deleteCharacter);

export default router;