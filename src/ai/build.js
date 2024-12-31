ai.build = ({ entity, entities }) => {
    const isBusy = entity?.action;
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
                ai.actions.build({ entity, target: closestBuildable, onDone: () => {
                    entity.action = null;
                    Object.keys(closestBuildable.onBuild).forEach(key => {
                        closestBuildable[key] = closestBuildable.onBuild[key];
                    });
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