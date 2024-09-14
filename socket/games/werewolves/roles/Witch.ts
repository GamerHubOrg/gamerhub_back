import { WerewolfRole, Power } from "./WerewolvePlayer";

class PotionPower extends Power {
    killPotionUsed: boolean;
    savePotionUsed: boolean;

    constructor() {
        super("games.werewolves.roles.witch.powerName", "games.werewolves.roles.witch.powerDescription");
        this.killPotionUsed = false;
        this.savePotionUsed = false;
    }

    useSavePotion() {
        this.savePotionUsed = true;
    }

    useKillPotion() {
        this.killPotionUsed = true;
    }
}

export default class Witch extends WerewolfRole {
    picture: string = 'witch';
    power: PotionPower;

    constructor() {
        super("games.werewolves.roles.witch.name", "Sorcière description", "village");
        this.power = new PotionPower();
    }
}