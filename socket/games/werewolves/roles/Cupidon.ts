import { WerewolfRole, Power } from "./WerewolvePlayer";

export default class Cupidon extends WerewolfRole {
    picture: string = 'TO_DEFINE';
    power: Power = new Power("Flêche de l'amour", "Vous choisissez deux personnes qui vont tomber amoureux l'une de l'autre");

    constructor() {
        super("Cupidon", "Cupidon description", "village");
    }
}