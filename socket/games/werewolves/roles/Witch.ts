import { WerewolfRole, Power } from "./WerewolvePlayer";

export default class Witch extends WerewolfRole {
    picture: string = '/src/assets/games/werewolves/images/icons/witch.png';
    power: Power = new Power("Potions", "Vous disposez d'une potion pouvant tuer un joueur et d'une potion pouvant ressuciter un joueur");

    constructor() {
        super("Sorcière", "Sorcière description", "village");
    }
}