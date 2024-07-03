import { WerewolfRole, Power } from "./WerewolvePlayer";

class PotionPower extends Power {
    killPotionUsed: boolean;
    savePotionUsed: boolean;

    constructor() {
        super("Potions", "Vous disposez d'une potion pouvant tuer un joueur et d'une potion pouvant ressuciter un joueur");
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
        super("Sorcière", "Sorcière description", "village");
        this.power = new PotionPower();
    }
}