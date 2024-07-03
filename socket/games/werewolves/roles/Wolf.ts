import { Power, WerewolfRole } from "./WerewolvePlayer";

export default class Wolf extends WerewolfRole {
    picture: string = '/assets/games/werewolves/images/icons/wolf.png';
    power: Power = new Power('Repas nocturne', "Décider d'une cible à dévorer avec les autres loups");

    constructor() {
        super("Loup", "Loup description", "wolves");
    }
}