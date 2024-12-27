const { h, render } = preact;
const { useState, useCallback, useEffect, useRef } = preactHooks;
const html = htm.bind(h);

const withController = (WrappedComponent) => {
  return (props) => {
    const [gameSpeed, setGameSpeed] = useState(1);
    const [tickCount, setTickCount] = useState(0);
    const [viewStack, setViewStack] = useState([{id: 'menu'}, {id: 'world'}]);
    const [activeView, setActiveView] = useState({id: 'world'});
    const [modalView, setModalView] = useState(null)
    const [hour, setHour] = useState(7);
    const [minute, setMinute] = useState(0);
    const [amPm, setAmPm] = useState('AM');
    const [day, setDay] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const isPausedRef = useRef(isPaused);
    const [ent, setEntities] = useState([
        {
            ...defs.simpleMeal,
            id: 1,
            dist: 0,
            count: 3,
        },
        {
            ...defs.human,
            id: 2,
            dist: 2,
            name: 'Jason',
            overall: 80,
            hunger: 34,
            mood: 63,
            rest: 11,
            health: 100,
        },
        {
            ...defs.simpleMeal,
            id: 3,
            dist: 3,
            count: 1,
        },
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
                        // Every 5 minutes
                        if (min % 5 === 0) {
                            // Reduce hunger
                            if (entity.hunger !== undefined) {
                                if (entity?.action?.type !== 'eat') {
                                    entity.hunger = Math.max(0, entity.hunger - 1);
                                }
                                if (entity.hunger <= 33 && !entity?.action) {
                                    const closestFood = locateClosestEntity({
                                        fromDist: entity.dist,
                                        type: 'food',
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
                        }
                        // Every 10 minutes
                        if (min % 10 === 0) {
                            // Reduce rest
                            if (entity.rest && entity?.action?.type !== 'sleep') {
                                entity.rest = Math.max(0, entity.rest - 1);
                            }
                            if (entity.rest <= 10) {
                                entity.action = {
                                    type: 'sleep',
                                }
                            }
                        }
                        // Every hour
                        if (min % 60 === 0) {
                            // Reduce health if starving
                            if (entity.health && entity.hunger === 0) {
                                entity.health = Math.max(0, entity.health - 1);
                            }
                        }
                        if (entity.overall) {
                            entity.overall = Math.round((entity.health + entity.hunger + entity.mood + entity.rest) / 4);
                        }

                        if (entity?.action) {
                            if (!entity.action.initilized) {
                                entity.action.initilized = true;
                                const target = Object.assign({}, entities.find(e => e.id === entity.action.targetId));
                                if (entity.action.type === 'walk') {
                                    // Handle walking
                                    const MINUTES_TO_WALK_ONE_UNIT = 5;
                                    entity.action = {
                                        ...entity.action,
                                        attr: 'dist',
                                        from: entity.dist,
                                        to: target.dist,
                                        rate: (target.dist - entity.dist) / (MINUTES_TO_WALK_ONE_UNIT * Math.abs(target.dist - entity.dist)),
                                        progress: 0,
                                        target,
                                    }
                                } else if (entity.action.type === 'eat') {
                                    // Handle eating
                                    const MINUTES_TO_EAT = 15;
                                    const caloriesPerMin = target?.calories / MINUTES_TO_EAT;
                                    const hungerPerMin = (caloriesPerMin / entity.dailyCalories) * 100;
                                    const t = entities.find(e => e.id === entity.action.targetId);
                                    t.count = Math.max(0, t?.count - 1);
                                    if (t.count === 0) {
                                        entities = entities.filter(e => e.id !== t?.id);
                                    }
                                    entity.action = {
                                        ...entity.action,
                                        attr: 'hunger',
                                        from: entity.hunger,
                                        to: 100,
                                        rate: hungerPerMin,
                                        progress: 0,
                                        target,
                                    }
                                } else if (entity.action.type === 'sleep') {
                                    entity.action = {
                                        ...entity.action,
                                        attr: 'rest',
                                        from: entity.rest,
                                        to: 100,
                                        rate: 0.2,
                                        progress: 0,
                                    }
                                }
                            }
                            const current = entity[entity.action.attr];
                            if (entity.action.to > entity.action.from) {
                                entity[entity.action.attr] = Math.min(entity.action.to, Math.max(0, current + entity.action.rate));
                            } else {
                                entity[entity.action.attr] = Math.max(entity.action.to, current + entity.action.rate);
                            }
                            entity.action.progress = Math.min(100, ((current - entity.action.from) / (entity.action.to - entity.action.from)) * 100);
                            if (entity.action.progress >= 100) {
                                if (entity.action.type === 'walk') {
                                    if (entity.action.target.type === 'food') {
                                        entity.action = {
                                            type: 'eat',
                                            targetId: entity.action.target.id,
                                        };
                                    } else {
                                        entity.action = null;
                                    }
                                } else {
                                    entity.action = null;
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
    
    return html`<${WrappedComponent} ...${{
        ...props,
        pushView,
        popView,
        state: {
            hour, setHour,
            minute, setMinute,
            amPm, setAmPm,
            day, setDay,
            viewStack, setViewStack,
            activeView, setActiveView,
            modalView, setModalView,
            entities: ent, setEntities,
            isPaused, setIsPaused,
            gameSpeed, setGameSpeed,
        }
    }} />`;
  };
};