ai.hunger = ({ entity, entities, gameSpeed}) => {
    const isEating = entity?.action?.name === 'eat';
    if (!isEating) {
        entity.hunger = Math.max(0, entity.hunger - (0.15 * gameSpeed));
        // Reduce health if starving
        if (entity.health !== undefined && entity.hunger <= 0) {
            entity.health = Math.max(0, entity.health - (0.017 * gameSpeed));
        }
        const isBusy = entity?.action;
        const isSleeping = entity?.action?.name === 'sleep';
        const TRY_EAT = 33;
        const FORCE_EAT = 10;
        if ((!isBusy && entity.hunger <= TRY_EAT) || (!isSleeping && entity.hunger <= FORCE_EAT)) {
            const closestFood = locateClosestEntity({
                fromDist: entity.dist,
                properties: {
                    'actions.eat.enabled': true,
                },
                entities,
            });
            if (closestFood) {
                ai.actions.walk({ target: closestFood, entity, onDone: () => ai.actions.eat({ target: closestFood, entity }) });
            }
        }
    }
}

ai.actions.eat = ({ target, entity}) => {
    const MINUTES_TO_EAT = 15;
    const calories = target?.actions?.eat?.calories
    const caloriesPerMin = calories / MINUTES_TO_EAT;
    const hungerPerMin = (caloriesPerMin / entity.dailyCaloriesNeeded) * 100;
    entity.action = {
        name: 'eat',
        targetId: target.id,
        entityId: entity.id,
        entityProp: 'hunger',
        from: entity.hunger,
        to: Math.min(100, entity.hunger + (calories / entity.dailyCaloriesNeeded) * 100),
        rate: hungerPerMin,
        onDone: ({log}) => {
            entity.action = null;
            log({
                entityId: entity.id,
                verb: 'ate',
                targetId: target.id,
            })
        }
    }
    target.delete = true;
}
