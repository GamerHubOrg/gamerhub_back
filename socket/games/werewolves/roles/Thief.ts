import { WerewolfRole, Power } from "./WerewolvePlayer";

export default class Thief extends WerewolfRole {
    picture: string = '/assets/games/werewolves/images/icons/thief.png';
    power: Power = new Power('Dérober', "Vous choisissez votre rôle parmis deux possibilitées");

    constructor() {
        super("Voleur", "Voleur description", "village");
    }
}