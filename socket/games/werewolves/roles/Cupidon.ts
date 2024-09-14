import { WerewolfRole, Power } from "./WerewolvePlayer";

export default class Cupidon extends WerewolfRole {
    picture: string = 'cupidon';
    power: Power = new Power("games.werewolves.roles.cupidon.powerName", "games.werewolves.roles.cupidon.powerDescription");

    constructor() {
        super("games.werewolves.roles.cupidon.name", "Cupidon description", "village");
    }
}