ai.grow = ({ entity, target }) => {
    const isBusy = entity?.action;
    if (!isBusy) {
        console.log(entity.progress);
        entity.action = {
            name: 'grow',
            targetId: entity.id,
            entityId: entity.id,
            entityProp: 'progress',
            from: 0,
            to: 100,
            rate: 0.05,
            progress: entity.progress,
        }
    }
}