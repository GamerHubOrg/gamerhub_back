export class WerewolfRole {
    name: string;
    camp: string;
    description: string;
    isAlive: boolean = true;
    isBeingKilled: boolean = false;
    deathTurn?: number;

    constructor (name: string, description: string, camp: string) {
        this.name = name;
        this.camp = camp;
        this.description = description;
    }

    setIsBeingKilled(value: boolean) {
        this.isBeingKilled = value;
    }

    setIsAlive(value: boolean) {
        this.isAlive = value;
    }

    setDeathTurn(value?: number) {
        this.deathTurn = value;
    }
}

export class Power {
    name: string;
    description: string;

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
    }
}
