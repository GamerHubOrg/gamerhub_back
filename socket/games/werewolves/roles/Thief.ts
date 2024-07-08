import { WerewolfRole, Power } from "./WerewolvePlayer";

export default class Thief extends WerewolfRole {
    picture: string = 'thief';
    power: Power = new Power('Dérober', "Vous choisissez votre rôle parmis deux possibilitées");

    constructor() {
        super("Voleur", "Voleur description", "village");
    }
}