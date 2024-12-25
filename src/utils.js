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