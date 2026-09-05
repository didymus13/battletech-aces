export interface Campaign {
    id: number,
    name: string,
    startingSp: number,
    mechs: Battlemech[],
    pilots: Pilot[],
    sorties: Sortie[],
    difficulty: "ROOKIE" | "STANDARD" | "VETERAN" | "ELITE" | "LEGENDARY",
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
    skillCost: number,
    edgeTokens: number,
    edgeTokenCost: number,
    edgeAbilities: string[],
    edgeAbilityCost: number,
    timesMvp: number,
    isWounded: Boolean,
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