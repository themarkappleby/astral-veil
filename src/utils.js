const getEntityIcon = (entityType) => {
    switch (entityType) {
        case 'structure': return 'building';
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
    stockpile,
}) => {
    const allEntities = [...entities, ...stockpile.map(s => ({ ...s.entity, dist: 0 }))];
    const sortedEntities = allEntities.sort((a, b) => a.dist - b.dist);
    return sortedEntities.find(e => e.type === type && e.dist <= fromDist);
}