const getEntityIcon = (entityType) => {
    switch (entityType) {
        case 'structure': return 'building';
        case 'food': return 'utensils';
        case 'resourceNode': return 'tree';
        case 'humanoid': return 'face-smile';
        default: return 'question';
    }
}

const getActionText = (action, state) => {
    if (!action) return 'Idle';
    const verbMap = {
        walk: 'Walking to',
        eat: 'Eating',
    }
    const actionTarget = state?.entities?.find(e => e.id === action?.target);
    return `${verbMap[action?.type]} ${actionTarget?.name?.toLowerCase() || ''} (ID ${actionTarget?.id}) ${action?.progress ? `${Math.round(action?.progress)}%` : ''}`;
}

const getStatusDesc = (type, value) => {
    const statuses = {
        overall: [
            { name: 'Great', min: 90 },
            { name: 'Good', min: 80 },
            { name: 'Average', min: 50 },
            { name: 'Poor', min: 20 },
            { name: 'Terrible', min: 0 },
        ],
        hunger: [
            { name: 'Full', min: 80 },
            { name: 'Satisfied', min: 50 },
            { name: 'Hungry', min: 20 },
            { name: 'Starving', min: 0 },
        ],
        mood: [
            { name: 'Happy', min: 80 },
            { name: 'Content', min: 50 },
            { name: 'Unhappy', min: 30 },
            { name: 'Depressed', min: 0 },
        ],
        rest: [
            { name: 'Rested', min: 80 },
            { name: 'Tired', min: 50 },
            { name: 'Exhausted', min: 0 },
        ],
        health: [
            { name: 'Healthy', min: 50 },
            { name: 'Unwell', min: 20 },
            { name: 'Dying', min: 0 },
        ],
    }
    return statuses[type].find(s => value >= s.min)?.name;
}

const toTitleCase = (str) => {
    if (typeof str !== 'string') return str;
    return str[0].toUpperCase() + str.slice(1);
}

const locateClosestEntity = ({
    fromDist,
    type,
    entities,
}) => {
    const sortedEntities = entities.map(e => ({ ...e, dist: Math.abs(e.dist - fromDist) })).sort((a, b) => a.dist - b.dist);
    return sortedEntities.find(e => e.type === type && e.dist <= fromDist);
}
