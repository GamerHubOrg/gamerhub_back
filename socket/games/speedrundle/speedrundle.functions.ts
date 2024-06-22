import CharacterModel from "../../../models/Character/Character.model";
import { ICharacter } from "../../../types/model.types";

export async function getGameCharacters(theme: string): Promise<ICharacter[]> {
  let characters: ICharacter[];
  switch (theme) {
    case "league_of_legends":
      characters = await CharacterModel.find({ "data.dataType": theme }).lean();

      break;
    default:
      characters = [];
      break;
  }
  return characters;
}
