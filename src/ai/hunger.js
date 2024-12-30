ai.hunger = ({ entity, entities, gameSpeed}) => {
    const isEating = entity?.action?.name === 'eat';
    if (!isEating) {
        entity.hunger = Math.max(0, entity.hunger - (0.15 * gameSpeed));
        const isBusy = entity?.action;
        const HUNGER_THRESHOLD = 33;
        if (!isBusy && entity.hunger <= HUNGER_THRESHOLD) {
            const closestFood = locateClosestEntity({
                fromDist: entity.dist,
                properties: {
                    type: 'food',
                },
                entities,
            });
            if (closestFood) {
                if (closestFood.dist === entity.dist) {
                    ai.actions.eat({ target: closestFood, entity });
                } else {
                    ai.actions.walk({ target: closestFood, entity, onDone: () => ai.actions.eat({ target: closestFood, entity }) });
                }
            }
        }
    }
}

ai.actions.eat = ({ target, entity}) => {
    const MINUTES_TO_EAT = 15;
    const caloriesPerMin = target?.calories / MINUTES_TO_EAT;
    const hungerPerMin = (caloriesPerMin / entity.dailyCaloriesNeeded) * 100;
    entity.action = {
        name: 'eat',
        targetId: target.id,
        entityId: entity.id,
        entityProp: 'hunger',
        from: entity.hunger,
        to: Math.min(100, entity.hunger + (target.calories / entity.dailyCaloriesNeeded) * 100),
        rate: hungerPerMin,
        onDone: () => {
            entity.action = null;
        }
    }
    target.count = Math.max(0, target?.count - 1);
    if (target.count === 0) {
        target.dist = -1;
    }
}
