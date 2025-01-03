const { h, render } = preact;
const { useState, useCallback, useEffect, useRef } = preactHooks;
const html = htm.bind(h);

const withController = (WrappedComponent) => {
  return (props) => {
    const [isPaused, setIsPaused] = useState(false);
    const [defaultGameSpeed, setDefaultGameSpeed] = useState(1);
    const [fastGameSpeed, setFastGameSpeed] = useState(0.1);
    const [gameSpeed, setGameSpeed] = useState(defaultGameSpeed);
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
    const [showDistanceMarkers, setShowDistanceMarkers] = useState(true);
    const isPausedRef = useRef(isPaused);
    const [availableConstruction, setAvailableConstruction] = useState([
        {...defs.cucumberPatchConstruction()},
    ]);

    const initialColonists = [
        {
            ...defs.human(),
            dist: 0,
            hunger: 33.1,
        },
    ]

    const [logEntries, setLogEntries] = useState(initialColonists.map(colonist => {
        return {
            entityId: colonist.id,
            verb: 'joined',
            time: formatTime(hour, minute, amPm),
            day,
        }
    }));

    const [ent, setEntities] = useState([
        {
            ...defs.cucumberSeedPack(),
            dist: 0,
        },
        {
            ...defs.simpleMeal(),
            dist: 0,
        },
        {
            ...defs.simpleMeal(),
            dist: 0,
        },
        {
            ...defs.simpleMeal(),
            dist: 0,
        },
        {
            ...defs.surroundings(),
            dist: 1,
        },
        initialColonists[0]
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
                        entity?.ai?.forEach(aiName => {
                            if (ai[aiName] && aiName !== 'actions') {
                                ai[aiName]({
                                    entity,
                                    entities,
                                    gameSpeed,
                                    log,
                                });
                            }
                        })
                        if (entity.action) {
                            const actionEntity = entities.find(e => e.id === entity.action.entityId);
                            const actionProp = entity.action.entityProp;
                            if (actionEntity[actionProp] === undefined) {
                                actionEntity[actionProp] = 0;
                            }
                            if (entity.action.to < entity.action.from) {
                                actionEntity[actionProp] = Math.max(entity.action.to, actionEntity[actionProp] - entity.action.rate);
                            } else if (entity.action.to > entity.action.from) {
                                actionEntity[actionProp] = Math.min(entity.action.to, actionEntity[actionProp] + entity.action.rate);
                            }
                            if (entity.action.from === entity.action.to) {
                                entity.action.progress = 100;
                            } else {
                                entity.action.progress = Math.abs(Math.min(100, ((actionEntity[actionProp] - entity.action.from) / (entity.action.to - entity.action.from)) * 100));
                            }
                            if (entity.action.progress >= 100) {
                                if (entity?.action?.onDone) {
                                    entity?.action?.onDone({entity, entities, log});
                                }
                            }
                        }
                        if (entity.overallProps) {
                            entity.overall = entity.overallProps.reduce((acc, prop) => acc + entity[prop], 0) / entity.overallProps.length;
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

    const log = (logEntry) => {
        setDay(prevDay => {
            setHour(prevHour => {
                setMinute(prevMinute => {
                    setAmPm(prevAmPm => {
                        setLogEntries(prevLogEntries => {
                            return [
                                {...logEntry, time: formatTime(prevHour, prevMinute, prevAmPm), day: prevDay},
                                ...prevLogEntries,
                            ]
                        })
                        return prevAmPm;
                    })
                    return prevMinute;
                })
                return prevHour;
            })
            return prevDay;
        })
    }

    const closeModal = () => {
        setModalVisible(false);
        setTimeout(() => {
            setActiveModalView(null);
            setModalViewStack([]);
        }, 200);
        const themeColor = document.querySelector("meta[name=theme-color]");
        themeColor.setAttribute("content", "#FFFFFF");
    }

    const pushModalView = (viewData) => {
        setModalVisible(true);
        setModalViewStack([...modalViewStack, viewData]);
        setActiveModalView(viewData);
        const themeColor = document.querySelector("meta[name=theme-color]");
        themeColor.setAttribute("content", "#D2D2D2");
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
            showDistanceMarkers, setShowDistanceMarkers,
            defaultGameSpeed, setDefaultGameSpeed,
            fastGameSpeed, setFastGameSpeed,
            logEntries, setLogEntries,
        }
    }} />`;
  };
};