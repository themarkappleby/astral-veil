const getEntityIcon = (entityType) => {
    switch (entityType) {
        case 'structure': return 'building';
        case 'food': return 'utensils';
        case 'resourceNode': return 'tree';
        case 'humanoid': return 'face-smile';
        default: return 'question';
    }
}

const getDistText = (dist) => {
    return dist === 0 ? 'At base' : `Dist ${Math.max(1, Math.floor(dist))}`;
}

const getActionText = (action, state) => {
    if (!action) return 'Idle';
    const verbMap = {
        walk: 'Walking to',
        eat: 'Eating',
        sleep: 'Sleeping',
    }
    const actionTarget = action.target;
    return `${verbMap[action?.type]} ${actionTarget?.name?.toLowerCase() || ''} ${action?.progress ? `${Math.round(action?.progress)}%` : ''}`;
}

const STATUSES = {
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
        { name: 'Rested', min: 50 },
        { name: 'Tired', min: 30 },
        { name: 'Exhausted', min: 0 },
    ],
    health: [
        { name: 'Healthy', min: 50 },
        { name: 'Unwell', min: 20 },
        { name: 'Dying', min: 0 },
    ],
}
const getStatusDesc = (type, value) => {
    return STATUSES[type].find(s => value >= s.min)?.name;
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
    const sortedEntities = entities.map(e => ({ ...e, diff: Math.abs(e.dist - fromDist) })).sort((a, b) => a.diff - b.diff);
    return sortedEntities.find(e => e.type === type && e.diff <= fromDist);
}
