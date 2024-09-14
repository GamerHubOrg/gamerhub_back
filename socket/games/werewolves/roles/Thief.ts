import { WerewolfRole, Power } from "./WerewolvePlayer";

export default class Thief extends WerewolfRole {
    picture: string = 'thief';
    power: Power = new Power("games.werewolves.roles.thief.powerName", "games.werewolves.roles.thief.powerDescription");

    constructor() {
        super("games.werewolves.roles.thief.name", "Voleur description", "village");
    }
}