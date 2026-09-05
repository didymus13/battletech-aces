export interface Campaign {
    id: Number,
    name: string,
    startingSp: Number,
    mechs: Battlemech[],
    pilots: Pilot[],
    sorties: Sortie[],
    difficulty: "ROOKIE" | "STANDARD" | "VETERAN" | "ELITE" | "LEGENDARY",
};

export interface Battlemech {
    id: Number,
    campaignId: Number,
    model: string,
    name: string,
    pv: string
};

export interface Pilot {
    id: Number,
    campaignId: Number,
    callsign: string,
    type: string,
    skill: Number,
    skillCost: Number,
    edgeTokens: Number,
    edgeTokenCost: Number,
    edgeAbilities: string[],
    edgeAbilityCost: Number,
    timesMvp: Number,
    isWounded: Boolean,
}

export interface Sortie {
    id: Number,
    campaignId: Number,
    datePlayed: Date,
    scenarioNumber: string,
    scenarioName: string,
    isWin: Boolean,
    primaryObjectiveSp: Number,
    otherObjectiveSp: Number,
    spModifier: Number,
    totalIncome: Number,
    reconSp: Number,
    waypoints: Number,
    rearming: Number,
    personnelWounded: Number,
    personnelNew: Number,
    repairsDestroyed: Number,
    repairsCrippled: Number,
    repairsStructure: Number,
    repairsArmor: Number,
    totalExpenses: Number,
    earning: Number
}