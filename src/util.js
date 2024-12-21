const getEntityIcon = (entityType) => {
    switch (entityType) {
        case 'structure': return 'building';
        case 'resourceNode': return 'tree';
        case 'colonist': return 'user';
        default: return 'question';
    }
}