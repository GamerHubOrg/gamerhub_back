import { Power, WerewolfRole } from "./WerewolvePlayer";

export default class Hunter extends WerewolfRole {
    picture: string = '/src/assets/games/werewolves/images/icons/hunter.png';
    power: Power = new Power('Après la mort', "Vous pouvez entrainer un autre joueur avec vous");

    constructor() {
        super("Chasseur", "Chasseur description", "village");
    }
}