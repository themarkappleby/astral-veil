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
            count: 10,
        },
        {
            ...defs.human,
            id: 2,
            dist: 8,
            name: 'Jason',
            overall: 80,
            hunger: 34,
            mood: 63,
            rest: 100,
            health: 100,
        },
        {
            ...defs.simpleMeal,
            id: 3,
            dist: 10,
            count: 10,
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
                    const entities = Object.assign([], prevEntities);
                    entities.forEach(entity => {
                        // Every 5 minutes
                        if (min % 5 === 0) {
                            if (entity.hunger && entity?.action?.type !== 'eat') {
                                entity.hunger = Math.max(0, entity.hunger - 1);
                                if (entity.hunger === 33) {
                                    const closestFood = locateClosestEntity({
                                        fromDist: entity.dist,
                                        type: 'food',
                                        entities,
                                    });
                                    console.log('hungry')
                                    if (closestFood) {
                                        console.log('closestFood', closestFood);
                                        if (closestFood.dist === entity.dist) {
                                            entity.action = {
                                                type: 'eat',
                                                target: closestFood.id,
                                                progress: 0,
                                            };
                                        } else {
                                            entity.action = {
                                                type: 'walk',
                                                target: closestFood.id,
                                                progress: 0,
                                            };
                                        }
                                    }
                                }
                            }
                        }
                        // Every 10 minutes
                        if (min % 10 === 0) {
                            if (entity.rest) {
                                entity.rest = Math.max(0, entity.rest - 1);
                            }
                        }
                        // Every hour
                        if (min % 60 === 0) {
                            if (entity.health && entity.hunger === 0) {
                                entity.health = Math.max(0, entity.health - 1);
                            }
                        }
                        if (entity.overall) {
                            entity.overall = Math.round((entity.health + entity.hunger + entity.mood + entity.rest) / 4);
                        }

                        if (entity.action?.type === 'walk') {
                            const target = entities.find(e => e.id === entity.action.target);
                            if (!entity.action.start) {
                                entity.action.start = entity.dist;
                            }
                            if (!entity.action.rate) {
                                const MINUTES_TO_WALK_ONE_UNIT = 5;
                                const distance = Math.abs(target.dist - entity.dist);
                                entity.action.rate = (target.dist - entity.dist) / (MINUTES_TO_WALK_ONE_UNIT * distance);
                            }
                            entity.dist = Math.min(target.dist, Math.max(0, entity.dist + entity.action.rate));
                            entity.action.progress = (entity.dist - entity.action.start) / (target.dist - entity.action.start) * 100;
                            if (entity.dist === target.dist) {
                                if (target.type === 'food') {
                                    entity.action = {
                                        type: 'eat',
                                        target: target.id,
                                        progress: 0,
                                    };
                                } else {
                                    entity.action = null;
                                }
                            }
                            /*
                            const target = entities.find(e => e.id === entity.action.target);
                            const MINUTES_TO_WALK_ONE_UNIT = 5;
                            if (!entity.action.distRemaining) {
                                entity.action.distRemaining = Math.abs(target.dist - entity.dist);
                            }
                            if (entity.action.distRemaining > 0) {
                                if (target.dist > entity.dist) {
                                    entity.dist = Math.max(0, entity.dist + (entity.action.distRemaining / MINUTES_TO_WALK_ONE_UNIT));
                                } else {
                                    entity.dist = Math.max(0, entity.dist - (entity.action.distRemaining / MINUTES_TO_WALK_ONE_UNIT));
                                }
                                entity.action.distRemaining = Math.max(0, entity.action.distRemaining - MINUTES_TO_WALK_ONE_UNIT);
                            }
                            */
                        }

                        if (entity.action?.type === 'eat') {    
                            const food = entities.find(e => e.id === entity.action.target);
                            
                            // Initialize calories remaining if first time eating and reduce food count
                            if (!entity.action.caloriesRemaining) {
                                entity.action.caloriesRemaining = food.calories;
                                food.count = Math.max(0, food.count - 1);
                            }

                            // Calculate calories and hunger changes per minute
                            const MINUTES_TO_EAT = 30;
                            const caloriesPerMin = food.calories / MINUTES_TO_EAT;
                            const hungerPerMin = (caloriesPerMin / entity.dailyCalories) * 100;

                            // Update calories remaining and hunger
                            entity.action.caloriesRemaining -= caloriesPerMin;
                            entity.hunger = Math.min(100, entity.hunger + hungerPerMin);

                            // Update eating progress
                            const caloriesConsumed = food.calories - entity.action.caloriesRemaining;
                            entity.action.progress = (caloriesConsumed / food.calories) * 100;

                            // Check if finished eating
                            if (entity.action.progress >= 100 || entity.hunger >= 100) {
                                entity.action = null;
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
                if (secondsElapsed(gameSpeed)) {
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
        }
    }} />`;
  };
};