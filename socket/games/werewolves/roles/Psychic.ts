import { WerewolfRole, Power } from "./WerewolvePlayer";

export default class Psychic extends WerewolfRole {
    picture: string = 'psychic';
    power: Power = new Power("games.werewolves.roles.psychic.powerName", "games.werewolves.roles.psychic.powerDescription");

    constructor() {
        super("games.werewolves.roles.psychic.name", "Voyante description", "village");
    }
}