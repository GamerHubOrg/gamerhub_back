import { Power, WerewolfRole } from "./WerewolvePlayer";

export default class Wolf extends WerewolfRole {
    picture: string = 'wolf';
    power: Power = new Power("games.werewolves.roles.wolf.powerName", "games.werewolves.roles.wolf.powerDescription");

    constructor() {
        super("games.werewolves.roles.wolf.name", "Loup description", "wolves");
    }
}