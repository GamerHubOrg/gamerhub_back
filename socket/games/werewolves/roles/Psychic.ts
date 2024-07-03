import { WerewolfRole, Power } from "./WerewolvePlayer";

export default class Psychic extends WerewolfRole {
    picture: string = '/assets/games/werewolves/images/icons/psychic.png';
    power: Power = new Power("Omnisience", "Vous pouvez connaitre le rôle d'un joueur chaque tour");

    constructor() {
        super("Voyante", "Voyante description", "village");
    }
}