import { WerewolfRole, Power } from "./WerewolvePlayer";

export default class Villager extends WerewolfRole {
    picture: string = '/src/assets/games/werewolves/images/icons/villager.png';
    power: Power = new Power('Rien', "Vous êtes la pour applaudir ceux qui ont des pouvoirs...");

    constructor() {
        super("Villageois", "Villageois description", "village");
    }
}