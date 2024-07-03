import { Power, WerewolfRole } from "./WerewolvePlayer";

export default class Hunter extends WerewolfRole {
    picture: string = 'hunter';
    power: Power = new Power('Après la mort', "Vous pouvez entrainer un autre joueur avec vous");

    constructor() {
        super("Chasseur", "Chasseur description", "village");
    }
}