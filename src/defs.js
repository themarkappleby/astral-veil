const defs = {}

defs.resources = {
    food: {
        bartlett_pear: {
            name: 'Bartlett pear',
            plural: 'Bartlett pears',
            description: 'A sweet, juicy pear with a firm texture.',
            size: 8,
            calories: 100,
        },
        honeycrisp_apple: {
            name: 'Honeycrisp apple',
            plural: 'Honeycrisp apples',
            description: 'A sweet, crisp apple with a firm texture.',
            size: 7,
            calories: 93,
        },
        raspberry: {
            name: 'Raspberry',
            plural: 'Raspberries',
            description: 'A red sweet, juicy fruit with a soft texture.',
            size: 1,
            calories: 1,
        }
    },
    wood: {
        branch: {
            name: 'Branch',
            plural: 'Branches',
            description: 'A branch from a tree.',
            size: 113,
            durability: 1,
        },
        birch: {
            name: 'Birch wood',
            description: 'A soft, lightweight wood often used for crafting and building.',
            size: 33000,
            durability: 5,
        },
        oak: {
            name: 'Oak wood',
            description: 'A strong, durable wood often used for building and construction.',
            size: 33000,
            durability: 10,
        },
        pine: {
            name: 'Pine wood',
            description: 'A light-colored wood often used for crafting and building.',
            size: 33000,
            durability: 8,
        }
    }
}

defs.resourceNodes = {
    bartlett_pear_trees: {
        name: 'Bartlett pear trees',
        description: 'A grouping of trees that produce Bartlett pears.',
        yields: [
            {resource: defs.resources.food.bartlett_pear, chance: 1},
            {resource: defs.resources.wood.branch, chance: 0.2},
        ],
        min_yield: 10,
        max_yield: 100,
    },
    raspberry_bushes: {
        name: 'Raspberry bushes',
        description: 'A patch of bushes that produce raspberries.',
        yields: [
            {resource: defs.resources.food.raspberry, chance: 1},
        ],
        min_yield: 30,
        max_yield: 100,
    }
}