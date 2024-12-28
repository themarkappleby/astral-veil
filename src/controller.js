const { h, render } = preact;
const { useState, useCallback, useEffect, useRef } = preactHooks;
const html = htm.bind(h);

const withController = (WrappedComponent) => {
  return (props) => {
    const [gameSpeed, setGameSpeed] = useState(1);
    const [tickCount, setTickCount] = useState(0);
    const [viewStack, setViewStack] = useState([{id: 'menu'}, {id: 'world'}]);
    const [activeView, setActiveView] = useState({id: 'world'});
    const [modalVisible, setModalVisible] = useState(false);
    const [modalViewStack, setModalViewStack] = useState([]);
    const [activeModalView, setActiveModalView] = useState(null);
    const [hour, setHour] = useState(7);
    const [minute, setMinute] = useState(0);
    const [amPm, setAmPm] = useState('AM');
    const [day, setDay] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const isPausedRef = useRef(isPaused);
    const [availableConstruction, setAvailableConstruction] = useState([
        {...defs.cucumberPatch()},
        {...defs.riceField()},
        {...defs.cornField()},
    ]);
    const [ent, setEntities] = useState([
        {
            ...defs.simpleMeal(),
            dist: 0,
            count: 5,
        },
        {
            ...defs.human(),
            dist: 0,
        },
        {
            ...defs.surroundings(),
            dist: 1,
        }
    ]);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        let lastTime = 0;
        const fps = 30;
        const frameInterval = 1000 / fps;

        const tick = () => {
            setTickCount(prevTickCount => {
                let min = prevTickCount + 1;
                if (min > 60) {
                    min = 1;
                }
                setEntities(prevEntities => {
                    let entities = Object.assign([], prevEntities);
                    entities.forEach(entity => {
                        // Reduce hunger
                        if (entity.hunger !== undefined) {
                            if (entity?.action?.type !== 'eat') {
                                entity.hunger = Math.max(0, entity.hunger - (0.15 * gameSpeed));
                            }
                            if (entity.hunger <= 33 && !entity?.action) {
                                const closestFood = locateClosestEntity({
                                    fromDist: entity.dist,
                                    properties: {
                                        type: 'food',
                                    },
                                    entities,
                                });
                                if (closestFood) {
                                    if (closestFood.dist === entity.dist) {
                                        entity.action = {
                                            type: 'eat',
                                            targetId: closestFood.id,
                                        };
                                    } else {
                                        entity.action = {
                                            type: 'walk',
                                            targetId: closestFood.id,
                                        };
                                    }
                                }
                            }
                        }
                        // Reduce rest
                        if (entity.rest !== undefined && entity?.action?.type !== 'sleep') {
                            entity.rest = Math.max(0, entity.rest - (0.1 * gameSpeed));
                        }
                        if (entity.rest <= 10) {
                            entity.action = {
                                type: 'sleep',
                            }
                        }
                        // Reduce health if starving
                        if (entity.health !== undefined && entity.hunger === 0) {
                            entity.health = Math.max(0, entity.health - (0.017 * gameSpeed));
                        }
                        if (entity.overall !== undefined) {
                            entity.overall = Math.round((entity.health + entity.hunger + entity.mood + entity.rest) / 4);
                        }

                        if (entity?.action) {
                            if (!entity.action.initilized) {
                                entity.action.initilized = true;
                                const target = entities.find(e => e.id === entity.action.targetId);
                                if (entity.action.type === 'walk') {
                                    // ==============================
                                    // Handle walking
                                    // ==============================
                                    const MINUTES_TO_WALK_ONE_UNIT = 5;
                                    entity.action = {
                                        ...entity.action,
                                        attr: 'dist',
                                        attrTarget: entity,
                                        from: entity.dist,
                                        to: target.dist,
                                        rate: (target.dist - entity.dist) / (MINUTES_TO_WALK_ONE_UNIT * Math.abs(target.dist - entity.dist)),
                                        progress: 0,
                                        target,
                                    }
                                } else if (entity.action.type === 'eat') {
                                    // ==============================
                                    // Handle eating
                                    // ==============================
                                    const MINUTES_TO_EAT = 15;
                                    const caloriesPerMin = target?.calories / MINUTES_TO_EAT;
                                    const hungerPerMin = (caloriesPerMin / entity.dailyCalories) * 100;
                                    target.count = Math.max(0, target?.count - 1);
                                    if (target.count === 0) {
                                        target.dist = -1;
                                    }
                                    entity.action = {
                                        ...entity.action,
                                        attr: 'hunger',
                                        attrTarget: entity,
                                        from: entity.hunger,
                                        to: 100,
                                        rate: hungerPerMin,
                                        progress: 0,
                                        target,
                                    }
                                } else if (entity.action.type === 'sleep') {
                                    // ==============================
                                    // Handle sleeping
                                    // ==============================
                                    entity.action = {
                                        ...entity.action,
                                        attr: 'rest',
                                        attrTarget: entity,
                                        from: entity.rest,
                                        to: 100,
                                        rate: 0.2,
                                        progress: 0,
                                    }
                                } else if (entity.action.type === 'build') {
                                    // ==============================
                                    // Handle building
                                    // ==============================
                                    const progress = target.progress;
                                    entity.action = {
                                        ...entity.action,
                                        attr: 'progress',
                                        attrTarget: target,
                                        from: progress,
                                        to: 100,
                                        rate: 0.4,
                                        progress,
                                    }
                                }
                            }
                            const current = entity.action.attrTarget[entity.action.attr];
                            if (entity.action.to > entity.action.from) {
                                entity.action.attrTarget[entity.action.attr] = Math.min(entity.action.to, Math.max(0, current + entity.action.rate));
                            } else {
                                entity.action.attrTarget[entity.action.attr] = Math.max(entity.action.to, current + entity.action.rate);
                            }
                            entity.action.progress = Math.min(100, ((current - entity.action.from) / (entity.action.to - entity.action.from)) * 100);
                            if (entity.action.progress >= 100) {
                                if (entity.action.type === 'walk') {
                                    if (entity.action.target.type === 'food') {
                                        entity.action = {
                                            type: 'eat',
                                            targetId: entity.action.target.id,
                                        };
                                    } else if (entity.action.target.type === 'construction') {
                                        entity.action = {
                                            type: 'build',
                                            targetId: entity.action.target.id,
                                        };
                                    } else {
                                        entity.action = null;
                                    }
                                } else if (entity.action.type === 'build') {
                                    // update state of construction entity such that its type changes from 'constructure' to 'building'
                                    const target = entities.find(e => e.id === entity.action.targetId);
                                    target.type = 'structure';
                                    delete target.progress;
                                    entity.action = null;
                                } else {
                                    entity.action = null;
                                }
                            }
                        } else if (entity.type === 'humanoid') {
                            // look for soemthing to do if not already doing something
                            const closestConstruction = locateClosestEntity({
                                fromDist: entity.dist,
                                properties: {
                                    type: 'construction',
                                    building: true,
                                },
                                entities,
                            });
                            if (closestConstruction) {
                                if (closestConstruction.dist === entity.dist) {
                                    entity.action = {
                                        type: 'build',
                                        targetId: closestConstruction.id,
                                    }
                                } else {
                                    entity.action = {
                                        type: 'walk',
                                        targetId: closestConstruction.id,
                                    }
                                }
                            }
                        }
                    });
                    return entities;
                });
                return min;
            });
        }

        const gameLoop = (timestamp) => {
            const secondsElapsed = (seconds) => Math.floor(timestamp / (seconds * 1000)) > Math.floor(lastTime / (seconds * 1000));
            const deltaTime = timestamp - lastTime;
            if (isPausedRef.current) {
                lastTime = timestamp;
                requestAnimationFrame(gameLoop);
                return;
            }
            if (deltaTime >= frameInterval) {
                setGameSpeed(speed => {
                    if (secondsElapsed(speed)) {
                        setMinute(prevMinute => {
                            const newMinute = prevMinute + 1
                            tick();
                            if (newMinute === 60) {
                                setHour(prevHour => {
                                    const newHour = prevHour + 1
                                    if (newHour === 12) {
                                        setAmPm(prevAmPm => {
                                            if (prevAmPm === 'PM') {
                                                setDay(prevDay => prevDay + 1);
                                            }
                                            return prevAmPm === 'AM' ? 'PM' : 'AM'
                                        });
                                    } else if (newHour === 13) {
                                        return 1;
                                    }
                                    return newHour;
                                });
                                return 0;
                            }
                            return newMinute;
                        });
                    }
                    return speed;
                })
                lastTime = timestamp;
            }
            requestAnimationFrame(gameLoop);
        };
        const animationId = requestAnimationFrame(gameLoop);
        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);

    const pushView = (viewData) => {
        setViewStack([...viewStack, viewData]);
        setActiveView(viewData);
    }

    const popView = () => {
        setActiveView(viewStack[viewStack.length - 2]);
        setTimeout(() => {
            setViewStack(viewStack.slice(0, -1));
        }, 200);
    }

    const closeModal = () => {
        setModalVisible(false);
        setTimeout(() => {
            setActiveModalView(null);
            setModalViewStack([]);
        }, 200);
    }

    const pushModalView = (viewData) => {
        setModalVisible(true);
        setModalViewStack([...modalViewStack, viewData]);
        setActiveModalView(viewData);
    }

    const popModalView = () => {
        setActiveModalView(modalViewStack[modalViewStack.length - 2]);
        setTimeout(() => {
            setModalViewStack(modalViewStack.slice(0, -1));
        }, 200);
    }
    
    return html`<${WrappedComponent} ...${{
        ...props,
        pushView,
        popView,
        closeModal,
        pushModalView,
        popModalView,
        state: {
            hour, setHour,
            minute, setMinute,
            amPm, setAmPm,
            day, setDay,
            viewStack, setViewStack,
            activeView, setActiveView,
            modalVisible, setModalVisible,
            modalViewStack, setModalViewStack,
            activeModalView, setActiveModalView,
            entities: ent, setEntities,
            isPaused, setIsPaused,
            gameSpeed, setGameSpeed,
            availableConstruction, setAvailableConstruction,
        }
    }} />`;
  };
};