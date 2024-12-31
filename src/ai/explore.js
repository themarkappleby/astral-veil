ai.explore = ({ entity, entities }) => {
    const isBusy = entity?.action;
    if (!isBusy) {
        const closestLocation = locateClosestEntity({
            fromDist: entity.dist,
            properties: {
                type: 'location',
                exploring: true,
            },
            entities,
        });
        if (closestLocation) {
            ai.actions.walk({ target: closestLocation, entity, onDone: () => {
                ai.actions.explore({ target: closestLocation, entity });
            }});
        }
    } else if (entity.action.name === 'explore') {
        const target = entities.find(e => e.id === entity.action.targetId);
        if (!target.exploring) {
            entity.action = null;
        }
    }
}

ai.actions.explore = ({ target, entity }) => {
    entity.action = {
        name: 'explore',
        targetId: target.id,
        entityId: target.id,
        entityProp: 'progress',
        from: target.progress || 0,
        to: 100,
        rate: 1,
        onDone: (entities) => {
            const spawnValue = getRandom(0, 100) / 100;
            Object.values(defs).forEach(d => {
                const def = d();
                if (def.spawnRate && spawnValue <= def.spawnRate) {
                    entities.push({...def, dist: target.dist});
                }
            });
            entity.action = null;
            target.progress = 0;
            target.dist += 1
        }
    }
}