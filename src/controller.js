const { h, render } = preact;
const { useState, useCallback, useEffect, useRef } = preactHooks;
const html = htm.bind(h);

const withController = (WrappedComponent) => {
  return (props) => {
    const [viewStack, setViewStack] = useState(['menu', 'world']);
    const [isPaused, setIsPaused] = useState(false);
    const isPausedRef = useRef(isPaused);
    const [activeView, setActiveView] = useState('world')
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [amPm, setAmPm] = useState('AM');
    const [day, setDay] = useState(1);
    const [stockpile, setStockpile] = useState([
        {
            name: 'Food',
            capacity: 10,
            items: [
                { name: 'Bartlett pear', count: 6 },
                { name: 'Honeycrisp apple', count: 2 },
            ]
        },
        {
            name: 'Wood',
            capacity: 10,
            items: [
                { name: 'Birch wood', count: 1 },
            ]
        },
    ]);

    const [entities, setEntities] = useState([
        {
            id: 0,
            name: 'Campfire',
            type: 'structure',
            dist: 0
        },
        {
            id: 1,
            name: 'Jason',
            type: 'colonist',
            status: 'Eating bartlett pear',
            dist: 0
        },
        {
            id: 2,
            name: 'Fritz',
            type: 'colonist',
            status: 'Chopping birch tree 67%',
            percent: 67,
            dist: 6
        },
        {
            id: 5,
            name: 'Murphy',
            type: 'colonist',
            status: 'Exploring 12%',
            percent: 12,
            dist: 12
        },
        {
            id: 3,
            name: 'Birch forest',
            type: 'resourceNode',
            status: '14 of 23',
            percent: 61,
            dist: 6
        },
        {
            id: 4,
            name: 'Raspberry patch',
            type: 'resourceNode',
            status: '4 of 4',
            percent: 100,
            dist: 10
        },
    ]);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        let lastTime = 0;
        const fps = 30;
        const frameInterval = 1000 / fps;

        const gameLoop = (timestamp) => {
            const secondsElapsed = (seconds) => Math.floor(timestamp / (seconds * 1000)) > Math.floor(lastTime / (seconds * 1000));
            const deltaTime = timestamp - lastTime;

            if (isPausedRef.current) {
                lastTime = timestamp;
                requestAnimationFrame(gameLoop);
                return;
            }
            
            if (deltaTime >= frameInterval) {
                if (secondsElapsed(1)) {
                    setMinute(prevMinute => {
                        const newMinute = prevMinute + 5
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

    const pushView = (viewId) => {
        setViewStack([...viewStack, viewId]);
        setActiveView(viewId);
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