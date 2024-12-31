ai.rest = ({ entity, gameSpeed }) => {
    const isSleeping = entity?.action?.name === 'sleep';
    if (!isSleeping) {
        entity.rest = Math.max(0, entity.rest - (0.1 * gameSpeed));
        const TRY_SLEEP = 10;
        const FORCE_SLEEP = 5;
        const isBusy = entity?.action;
        if ((!isBusy && entity.rest <= TRY_SLEEP) || entity.rest <= FORCE_SLEEP) {
            ai.actions.sleep({ entity });
        }
    }
}

ai.actions.sleep = ({ entity }) => {
    entity.action = {
        name: 'sleep',
        entityId: entity.id,
        entityProp: 'rest',
        from: entity.rest,
        to: 100,
        rate: 0.2,
        onDone: () => {
            entity.action = null;
        }
    }
}