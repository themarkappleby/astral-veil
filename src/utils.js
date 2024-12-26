const getEntityIcon = (entityType) => {
    switch (entityType) {
        case 'structure': return 'building';
        case 'food': return 'utensils';
        case 'resourceNode': return 'tree';
        case 'humanoid': return 'face-smile';
        default: return 'question';
    }
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
    const sortedEntities = entities.sort((a, b) => a.dist - b.dist);
    return sortedEntities.find(e => e.type === type && e.dist <= fromDist);
}