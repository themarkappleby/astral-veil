defs.simpleMeal = () => ({
    id: newId(),
    name: 'Simple meal',
    pluralName: 'Simple meals',
    icon: 'utensils',
    description: 'A simple meal consisting primarily of one main ingredient.',
    spawnRate: 0.2,
    actions: {
        eat: {
            calories: 1450,
            enabled: true,
        },
        haul: {
            size: 100,
            enabled: true,
        },
    }
})

defs.human = () => {
    const gender = getRandomGender();
    return {
        id: newId(),
        name: getRandomName(gender),
        surname: getRandomSurname(),
        ai: ['rest', 'hunger', 'build', 'explore'],
        age: getRandom(18, 65),
        gender,
        type: 'humanoid',
        icon: 'face-smile',
        description: 'A bipedal humanoid being.',
        overallProps: ['health', 'mood', 'rest', 'hunger', 'recreation', 'comfort'],
        health: getRandom(70, 100),
        mood: getRandom(70, 100),
        rest: getRandom(70, 100),
        hunger: getRandom(70, 100),
        recreation: getRandom(70, 100),
        comfort: getRandom(70, 100),
        dailyCaloriesNeeded: 2200,
    }
}

defs.cucumberSeedPack = () => ({
    id: newId(),
    name: 'Cucumber seed pack',
    pluralName: 'Cucumber seed packs',
    icon: 'box',
    description: 'A pack of cucumber seeds.',
    actions: {
        haul: {
            enabled: true,
            size: 1,
        }
    }
})

defs.cucumberPatchConstruction = () => ({
    id: newId(),
    name: 'Cucumber patch',
    pluralName: 'Cucumber patches',
    icon: 'hammer',
    description: 'A plot of land dedicated to growing cucumbers.',
    actions: {
        build: {
            enabled: true,
            rate: 0.8,
            materials: [
                {
                    name: 'cucumberSeedPack',
                    count: 1,
                }
            ],
            onComplete: 'cucumberPatch',
        }
    }
})

defs.cucumberPatch = () => ({
    id: newId(),
    name: 'Cucumber patch',
    pluralName: 'Cucumber patches',
    icon: 'seedling',
    description: 'A patch of growing cucumbers.',
    progress: getRandom(0, 100),
    ai: ['grow'],
    spawnRate: 0.2,
    actions: {
        harvest: {
            enabled: true,
            yield: ['cucumber']
        }
    }
})

defs.surroundings = () => ({
    id: newId(),
    name: 'Surroundings',
    icon: 'location-dot',
    description: 'The edge of the known area around your base. Who knows what might lie beyond?',
    actions: {
        explore: {
            enabled: true,
        }
    }
})