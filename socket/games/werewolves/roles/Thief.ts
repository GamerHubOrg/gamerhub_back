import { WerewolfRole, Power } from "./WerewolvePlayer";

export default class Thief extends WerewolfRole {
    picture: string = 'TO_DEFINE';
    power: Power = new Power('Dérober', "Vous choisissez votre rôle parmis deux possibilitées");

    constructor() {
        super("Voleur", "Voleur description", "village");
    }
}