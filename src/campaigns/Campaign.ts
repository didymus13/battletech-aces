export interface _links {
    [key: string]: {
        href: string
    }
}

export interface CollectionResponse<T> {
    _embedded: {
        [key: string]: T[]
    },
    _links: _links,
}

export interface Campaign {
    id: number,
    name: string,
    startingSp: number,
    mechs: Battlemech[],
    pilots: Pilot[],
    sorties: Sortie[],
    difficulty: "ROOKIE" | "STANDARD" | "VETERAN" | "ELITE" | "LEGENDARY",
    playerForceModifier: number,
    spEarnedModifier: number,
    _links: _links
};

export interface Battlemech {
    id: number,
    campaignId: number,
    model: string,
    name: string,
    pv: string
};

export interface Pilot {
    id: number,
    campaignId: number,
    callsign: string,
    type: string,
    skill: number,
    skillCost: number | null,
    edgeTokens: number,
    edgeTokenCost: number | null,
    edgeAbilities: string[],
    edgeAbilityCost: number | null,
    timesMvp: number,
    isWounded: Boolean,
    isDead: boolean,
    isCo: boolean,
}

export interface Sortie {
    id: number,
    campaignId: number,
    datePlayed: Date,
    scenarionumber: string,
    scenarioName: string,
    isWin: Boolean,
    primaryObjectiveSp: number,
    otherObjectiveSp: number,
    spModifier: number,
    totalIncome: number,
    reconSp: number,
    waypoints: number,
    rearming: number,
    personnelWounded: number,
    personnelNew: number,
    repairsDestroyed: number,
    repairsCrippled: number,
    repairsStructure: number,
    repairsArmor: number,
    totalExpenses: number,
    earning: number
}