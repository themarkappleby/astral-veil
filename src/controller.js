const { h, render } = preact;
const { useState, useCallback, useEffect, useRef } = preactHooks;
const html = htm.bind(h);

const withController = (WrappedComponent) => {
  return (props) => {
    const [gameSpeed, setGameSpeed] = useState(1);
    const [tickCount, setTickCount] = useState(0);
    const [viewStack, setViewStack] = useState([{id: 'menu'}, {id: 'world'}]);
    const [activeView, setActiveView] = useState({id: 'world'});
    const [hour, setHour] = useState(7);
    const [minute, setMinute] = useState(0);
    const [amPm, setAmPm] = useState('AM');
    const [day, setDay] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const isPausedRef = useRef(isPaused);
    // const [stockpile, setStockpile] = useState([
    //     {
    //         name: 'Food',
    //         capacity: 10,
    //         items: [
    //             { name: 'Bartlett pear', count: 6 },
    //             { name: 'Honeycrisp apple', count: 2 },
    //         ]
    //     },
    // ]);

    const [stockpile, setStockpile] = useState([
        { entity: defs.honeycrispApple, count: 10 },
    ]);

    const [entities, setEntities] = useState([
        {
            id: 1,
            name: 'Jason',
            type: 'humanoid',
            status: 'Idle',
            dist: 0,
            condition: {
                overall: 80,
                hunger: 87,
                mood: 63,
                rest: 100,
                health: 100,
            }
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
                    return prevEntities.map(entity => {
                        if (entity?.condition) {
                            const newCondition = {...entity.condition};
                            // Every 5 minutes
                            if (newTickCount % 5 === 0) {
                                if (newCondition.hunger) {
                                    newCondition.hunger = Math.max(0, newCondition.hunger - 1);
                                }
                            }
                            // Every 10 minutes
                            if (newTickCount % 10 === 0) {
                                if (newCondition.rest) {
                                    newCondition.rest = Math.max(0, newCondition.rest - 1);
                                }
                            }
                            // Every hour
                            if (newTickCount % 60 === 0) {
                                if (newCondition.health && newCondition.hunger === 0) {
                                    newCondition.health = Math.max(0, newCondition.health - 1);
                                }
                            }
                            newCondition.overall = Math.round((newCondition.health + newCondition.hunger + newCondition.mood + newCondition.rest) / 4);
                            return {
                                ...entity,
                                condition: newCondition
                            };
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
            stockpile, setStockpile,
            entities, setEntities,
            isPaused, setIsPaused,
        }
    }} />`;
  };
};