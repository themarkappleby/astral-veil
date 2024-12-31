ai.build = ({ entity, entities }) => {
    const isBusy = entity?.action;
    if (entity?.action?.name === 'build') {
        const target = entities.find(e => e.id === entity?.action?.targetId);
        if (target.dist === -1) {
            entity.action = null
        }
        return;
    }
    if (!isBusy) {
        const closestBuildable = locateClosestEntity({
            fromDist: entity.dist,
            properties: {
                type: 'construction',
            },
            entities,
        });
        if (closestBuildable) {
            ai.actions.walk({ target: closestBuildable, entity, onDone: () => {
                ai.actions.build({ entity, target: closestBuildable, onDone: e => {
                    entity.action = null;
                    const builtEntity = {...closestBuildable.onBuild(), progress: 0, dist: closestBuildable.dist};
                    e.push(builtEntity);
                    closestBuildable.dist = -1;
                } })
            } });
        }
    }
}

ai.actions.build = ({ entity, target, onDone }) => {
    entity.action = {
        name: 'build',
        targetId: target.id,
        entityId: target.id,
        entityProp: 'progress',
        from: target.progress,
        to: 100,
        rate: 0.2,
        onDone
    }
}