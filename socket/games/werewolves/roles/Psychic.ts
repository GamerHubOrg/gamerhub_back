import { WerewolfRole, Power } from "./WerewolvePlayer";

export default class Psychic extends WerewolfRole {
    picture: string = 'TO_DEFINE';
    power: Power = new Power("Omnisience", "Vous pouvez connaitre le rôle d'un joueur chaque tour");

    constructor() {
        super("Voyante", "Voyante description", "village");
    }
}