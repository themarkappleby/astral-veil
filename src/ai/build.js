ai.build = ({ entity, entities, log }) => {
    const isBusy = entity?.action;
    if (entity?.action?.name === 'build') {
        const target = entities.find(e => e.id === entity?.action?.targetId);
        if (target.delete || target.building === false) {
            entity.action = null
        }
        return;
    }
    if (!isBusy) {
        const closestBuildable = locateClosestEntity({
            fromDist: entity.dist,
            properties: {
                'actions.build.enabled': true,
            },
            entities,
        });
        if (closestBuildable && closestBuildable?.building) {
            ai.actions.walk({ target: closestBuildable, entity, onDone: () => {
                ai.actions.build({ entity, target: closestBuildable, onDone: update => {
                    entity.action = null;
                    const newBuild = defs[closestBuildable?.actions?.build?.onComplete]()
                    const builtEntity = {...newBuild, progress: 0, dist: closestBuildable.dist};
                    update.entities.push(builtEntity);
                    update.pushLog(`${entity.name} built ${builtEntity.name}`)
                    closestBuildable.delete = true;
                } })
            } });
        }
    }
}

ai.actions.build = ({ entity, target, onDone }) => {
    const FALLBACK_RATE = 0.2;
    entity.action = {
        name: 'build',
        targetId: target.id,
        entityId: target.id,
        entityProp: 'progress',
        from: target.progress,
        to: 100,
        rate: target?.actions?.build?.rate || FALLBACK_RATE,
        onDone
    }
}