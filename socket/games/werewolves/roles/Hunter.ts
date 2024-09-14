import { Power, WerewolfRole } from "./WerewolvePlayer";

export default class Hunter extends WerewolfRole {
    picture: string = 'hunter';
    power: Power = new Power("games.werewolves.roles.hunter.powerName", "games.werewolves.roles.hunter.powerDescription");

    constructor() {
        super("games.werewolves.roles.hunter.name", "Chasseur description", "village");
    }
}