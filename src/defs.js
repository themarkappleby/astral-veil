defs.bartlettPear = () => ({
    id: newId(),
    name: 'Bartlett pear',
    pluralName: 'Bartlett pears',
    type: 'food',
    description: 'A sweet, juicy pear with a firm texture.',
    size: 8,
    calories: 100,
})

defs.honeycrispApple = () => ({
    id: newId(),
    name: 'Honeycrisp apple',
    pluralName: 'Honeycrisp apples',
    type: 'food',
    description: 'A sweet, juicy apple with a firm texture.',
    size: 8,
    calories: 90,
})

defs.simpleMeal = () => ({
    id: newId(),
    name: 'Simple meal',
    pluralName: 'Simple meals',
    type: 'food',
    description: 'A simple meal consisting primarily of one main ingredient.',
    size: 16,
    calories: 1450,
})

defs.birchWood = () => ({
    id: newId(),
    name: 'Birch wood',
    pluralName: 'Birch wood',
    type: 'wood',
    description: 'A piece of birch wood.',
    size: 8,
})

defs.human = () => {
    const gender = getRandomGender();
    return {
        id: newId(),
        name: getRandomName(gender),
        surname: getRandomSurname(),
        ai: ['rest', 'hunger', 'build'],
        age: getRandom(18, 65),
        gender,
        type: 'humanoid',
        description: 'A bipedal humanoid being.',
        overallProps: ['health', 'mood', 'rest', 'hunger', 'recreation', 'comfort'],
        health: getRandom(70, 100),
        mood: getRandom(70, 100),
        rest: getRandom(70, 100),
        hunger: getRandom(70, 100),
        recreation: getRandom(70, 100),
        comfort: getRandom(70, 100),
        size: 2000,
        dailyCaloriesNeeded: 2200,
    }
}

defs.cucumberPatch = () => ({
    id: newId(),
    name: 'Cucumber patch',
    pluralName: 'Cucumber patches',
    type: 'construction',
    description: 'A patch of cucumbers.',
    size: 100,
    onBuild: {
        type: 'crop',
        progress: 0,
        ai: ['grow'],
    }
})

defs.riceField = () => ({
    id: newId(),
    name: 'Rice field',
    pluralName: 'Rice fields',
    type: 'construction',
    description: 'A field of rice.',
    size: 100,
})

defs.cornField = () => ({
    id: newId(),
    name: 'Corn field',
    pluralName: 'Corn fields',
    type: 'construction',
    description: 'A field of corn.',
    size: 100,
})

defs.surroundings = () => ({
    id: newId(),
    name: 'Surroundings',
    type: 'location',
    description: 'The edge of the known area around your base. Who knows what might lie beyond?',
    exploring: false,
})