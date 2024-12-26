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
    const [entities, setEntities] = useState([
        {
            ...defs.honeycrispApple,
            id: 1,
            dist: 0,
            count: 10,
        },
        {
            ...defs.human,
            id: 2,
            dist: 0,
            name: 'Jason',
            queue: [],
            overall: 80,
            hunger: 87,
            mood: 63,
            rest: 100,
            health: 100,
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
                let newTickCount = prevTickCount + 1;
                if (newTickCount > 100) {
                    newTickCount = 1;
                }
                setEntities(prevEntities => {
                    return prevEntities.map(e => {
                        const entity = { ...e };

                        if (e.queue) {
                            entity.queue = [...e.queue];
                        }

                        if (e.condition) {
                            entity.condition = {...e.condition};
                        }

                        // Every 5 minutes
                        if (newTickCount % 5 === 0) {
                            if (entity.hunger) {
                                entity.hunger = Math.max(0, entity.hunger - 1);
                                if (entity.hunger < 33) {
                                    entity.queue.push('eat');
                                }
                            }
                        }
                        // Every 10 minutes
                        if (newTickCount % 10 === 0) {
                            if (entity.rest) {
                                entity.rest = Math.max(0, entity.rest - 1);
                            }
                        }
                        // Every hour
                        if (newTickCount % 60 === 0) {
                            if (entity.health && entity.hunger === 0) {
                                entity.health = Math.max(0, entity.health - 1);
                            }
                        }
                        if (entity.overall) {
                            entity.overall = Math.round((entity.health + entity.hunger + entity.mood + entity.rest) / 4);
                        }

                        const action = entity?.queue?.[0];
                        if (action) {
                            if (action === 'eat') {
                                // locate closest food
                                const closestFood = locateClosestEntity({
                                    fromDist: entity.dist,
                                    type: 'food',
                                    entities,
                                });
                                if (closestFood) {
                                    entity.hunger = Math.min(100, entity.hunger + closestFood.calories);
                                    entity.queue.shift();
                                    // TODO: reduce count of closest food
                                    // closestFood.count = Math.max(0, closestFood.count - 1);
                                }
                            }
                        }
                        return entity;
                    });
                });
                return newTickCount;
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
            entities, setEntities,
            isPaused, setIsPaused,
        }
    }} />`;
  };
};