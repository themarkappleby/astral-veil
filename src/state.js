const { h, render } = preact;
const { useState, useCallback, useEffect } = preactHooks;
const html = htm.bind(h);

const withState = (WrappedComponent) => {
  return (props) => {
    const [viewStack, setViewStack] = useState(['menu', 'world']);
    const [activeView, setActiveView] = useState('world')
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [amPm, setAmPm] = useState('AM');
    const [day, setDay] = useState(1);

    useEffect(() => {
        let lastTime = 0;
        const fps = 30;
        const frameInterval = 1000 / fps;

        const gameLoop = (timestamp) => {
            const secondsElapsed = (seconds) => Math.floor(timestamp / (seconds * 1000)) > Math.floor(lastTime / (seconds * 1000));
            const deltaTime = timestamp - lastTime;
            if (deltaTime >= frameInterval) {
                if (secondsElapsed(1)) {
                    setMinute(prevMinute => {
                        const newMinute = prevMinute + 15
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
                    })
                }
                lastTime = timestamp;
            }
            requestAnimationFrame(gameLoop);
        };

        const animationId = requestAnimationFrame(gameLoop);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [])

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
            activeView, setActiveView
        }
    }} />`;
  };
};