import { WerewolfRole, Power } from "./WerewolvePlayer";

export default class Villager extends WerewolfRole {
    picture: string = 'villager';
    power: Power = new Power("games.werewolves.roles.villager.powerName", "games.werewolves.roles.villager.powerDescription");

    constructor() {
        super("games.werewolves.roles.villager.name", "Villageois description", "village");
    }
}