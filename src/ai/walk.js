ai.actions.walk = ({ entity, target, onDone }) => {
    const MINUTES_TO_WALK_ONE_UNIT = 5;
    entity.action = {
        name: 'walk',
        targetId: target.id,
        entityId: entity.id,
        entityProp: 'dist',
        from: entity.dist,
        to: target.dist,
        rate: Math.abs((target.dist - entity.dist) / (MINUTES_TO_WALK_ONE_UNIT * (target.dist - entity.dist))),
        onDone
    };
}