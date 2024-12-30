ai.rest = ({ entity, gameSpeed }) => {
    const isSleeping = entity?.action?.name === 'sleep';
    if (!isSleeping) {
        entity.rest = Math.max(0, entity.rest - (0.1 * gameSpeed));
        const REST_TRY_THRESHOLD = 10;
        const REST_FORCE_THRESHOLD = 5;
        const isBusy = entity?.action;
        if ((!isBusy && entity.rest <= REST_TRY_THRESHOLD) || entity.rest <= REST_FORCE_THRESHOLD) {
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