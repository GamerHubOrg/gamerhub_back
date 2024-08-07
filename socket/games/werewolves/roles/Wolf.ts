import { Power, WerewolfRole } from "./WerewolvePlayer";

export default class Wolf extends WerewolfRole {
    picture: string = 'wolf';
    power: Power = new Power('Repas nocturne', "Décider d'une cible à dévorer avec les autres loups");

    constructor() {
        super("Loup", "Loup description", "wolves");
    }
}