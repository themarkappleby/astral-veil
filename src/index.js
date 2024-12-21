const { h, render } = preact;
const { useState, useCallback, useEffect } = preactHooks;
const html = htm.bind(h);

const withState = (WrappedComponent) => {
  return (props) => {
    const enhancedProps = { ...props, extraProp: "Hello" };
    return html`<${WrappedComponent} ...${enhancedProps} />`;
  };
};

const App = ({ extraProp }) => {
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

    const views = {
        menu: {
            title: 'Menu',
            children: html`
                <${List}>
                    <${ListItem} icon="globe" onClick=${() => pushView('world')}>World</${ListItem}>
                    <${ListItem} icon="gear" onClick=${() => {}}>Settings</${ListItem}>
                </${List}>
            `,
        },
        world: {
            title: 'World',
            children: html`
                <${List} title="Status">
                    <${ListItem}>
                        <div class="status">
                            <div>${extraProp} Summer, day ${day}</div>
                            <div>${hour}:${minute < 10 ? '0' : ''}${minute} ${amPm}</div>
                            <div>Sunny, 23 °C</div>
                        </div>
                    </${ListItem}>
                </${List}>
                <${List} title="Stockpile">
                    <${ListItem} icon="box" percent="80" onClick=${() => {}}>Food: 8 of 10</${ListItem}>
                    <${ListItem} icon="box" percent="10" onClick=${() => {}}>Wood: 1 of 10</${ListItem}>
                </${List}>
                <${List} title="Base">
                    <${ListItem} icon="building" onClick=${() => {}}>Campfire</${ListItem}>
                    <${ListItem} icon="user" color="11" onClick=${() => pushView('jason')}>Jason: Eating bartlett pear</${ListItem}>
                </${List}>
                <${List} title="Surroundings">
                    <${ListItem} icon="user" color="11" percent="67" right="Dist 6" onClick=${() => {}}>Fritz: Chopping birch tree 67%</${ListItem}>
                    <${ListItem} percent="64" icon="tree" right="Dist 6" onClick=${() => {}}>Birch forest: 14 of 23</${ListItem}>
                    <${ListItem} percent="100" icon="tree" right="Dist 10" onClick=${() => {}}>Raspberry patch: 4 of 4</${ListItem}>
                    <${ListItem} icon="user" color="11" percent="12" right="Dist 12" onClick=${() => {}}>Murphy: Exploring 12%</${ListItem}>
                    <${ListItem} right=${html`<${Toggle} />`}>Explore</${ListItem}>
                </${List}>
            `,
        },
        jason: {
            title: 'Jason',
            children: html`
                <${List} title="Current job">
                    <${ListItem}>Eating bartlett pear</${ListItem}>
                </${List}>
                <${List} title="Details">
                    <${ListItem} icon="heart" onClick=${() => {}}>Health</${ListItem}>
                    <${ListItem} icon="user" onClick=${() => {}}>Jobs</${ListItem}>
                    <${ListItem} icon="box" onClick=${() => {}}>Inventory</${ListItem}>
                    <${ListItem} icon="book" onClick=${() => {}}>Backstory</${ListItem}>
                </${List}>
            `,
        }
    }

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

    return html`
        <div class="container">
            <div class="app" style="transform: translateX(${viewStack.indexOf(activeView) * -100}%)">
                ${viewStack.map((viewId, index) => {
                    const view = views[viewId];
                    const lastViewId = viewStack[index - 1];
                    const lastView = views[lastViewId];
                    return html`
                        <${View} title=${view.title} backLabel=${lastView?.title} onBackClick=${() => popView()}>
                            ${view.children}
                        </${View}>
                    `;
                })}
            </div>
            <div class="goal">
                <${List}>
                    <${ListItem} icon="flag-checkered" percent="10">Collect wood: 1 of 10</${ListItem}>
                </${List}>
            </div>
        </div>
    `;
};

const View = ({ title, children, backLabel, onBackClick }) => {
    return html`
        <div class="view">
            <div class="view-header">
                ${backLabel ? html`<button class="view-back" onClick=${onBackClick}><i class="fa-solid fa-chevron-left"></i> ${backLabel}</button>` : ''}
                <h2 class="view-title">${title}</h2>
            </div>
            <div class="view-content">
                ${children}
            </div>
        </div>
    `;
};

const List = ({ title, children }) => {
    return html`
        <div class="list">
            ${title && html`<h3 class="list-title">${title}</h3>`}
            <div class="list-items">
                ${children}
            </div>
        </div>
    `
}

const ListItem = ({ icon, color, children, right, onClick, percent }) => {
    const container = onClick ? 'button' : 'div';
    return html`
        <${container} class="list-item" onClick=${onClick}>
            ${percent ? html`<div class="list-item-percent" style="width: ${percent}%" />` : ''}
            <div class="list-item-left">
                ${icon ? html`<${Icon} name=${icon} color=${color} />` : ''}
                ${children}
            </div>
            ${(right || onClick) ? html`
                <div class="list-item-right">
                    ${right ? html`<div class="list-item-right">${right}</div>` : ''}
                    ${onClick ? html`<div class="list-item-arrow"><i class="fa-solid fa-chevron-right"></i></div>` : ''}
                </div>
            ` : ''}
        </${container}>
    `
}

const Toggle = ({ value, onChange }) => {
    return html`
        <div class="toggle-container">
            <input type="checkbox" class="toggle" checked=${value} onChange=${onChange} />
            <button class="toggle-slider"></button>
        </div>
    `
}

const Icon = ({ name, color }) => {
    return html`<div class="icon ${color && `color-bg-${color}`}"><i class="fa-solid fa-${name}"></i></div>`;
}

render(h(withState(App)), document.body);