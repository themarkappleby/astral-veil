const { h, render } = preact;
const { useState, useCallback } = preactHooks;
const html = htm.bind(h);

const App = () => {
    const [viewStack, setViewStack] = useState(['menu', 'world']);
    const [activeView, setActiveView] = useState('world')

    const views = {
        menu: {
            title: 'Menu',
            children: html`
                <${List}>
                    <${ListItem} icon="globe" onClick=${() => pushView('world')}>World</${ListItem}>
                    <${ListItem} icon="gear">Settings</${ListItem}>
                </${List}>
            `,
        },
        world: {
            title: 'World',
            children: html`
                <${List} title="Status">
                    <${ListItem}>
                        <div class="status">
                            <div>Summer, day 1</div>
                            <div>9 AM</div>
                            <div>Sunny, 23 °C</div>
                        </div>
                    </${ListItem}>
                </${List}>
                <${List} title="Stockpile">
                    <${ListItem} icon="box" onClick=${() => {}}>Food: 12</${ListItem}>
                    <${ListItem} icon="box" onClick=${() => {}}>Wood: 28</${ListItem}>
                    <${ListItem} icon="box" onClick=${() => {}}>Stone: 3</${ListItem}>
                </${List}>
                <${List} title="Base">
                    <${ListItem} icon="building" onClick=${() => {}}>Campfire</${ListItem}>
                    <${ListItem} icon="user" color="11" onClick=${() => pushView('jason')}>Jason: Idle</${ListItem}>
                </${List}>
                <${List} title="Surroundings">
                    <${ListItem} icon="user" color="11" percent="67" right="Dist 6" onClick=${() => {}}>Sarah: Chopping tree 67%</${ListItem}>
                    <${ListItem} percent="64" icon="tree" right="Dist 6" onClick=${() => {}}>Birch forest: 14 of 23</${ListItem}>
                    <${ListItem} percent="100" icon="tree" right="Dist 10" onClick=${() => {}}>Raspberry bush: 42 of 42</${ListItem}>
                    <${ListItem} icon="user" color="11" percent="12" right="Dist 12" onClick=${() => {}}>Gordon: Exploring 12%</${ListItem}>
                    <${ListItem} right=${html`<${Toggle} />`}>Explore</${ListItem}>
                </${List}>
            `,
        },
        jason: {
            title: 'Jason',
            children: html`
                <${List}>
                    <${ListItem} icon="heart">Health</${ListItem}>
                    <${ListItem} icon="box">Inventory</${ListItem}>
                    <${ListItem} icon="book">Backstory</${ListItem}>
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
        <div class="app" style="transform: translateX(${viewStack.indexOf(activeView) * -100}vw)">
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
    return html`
        <button class="list-item" onClick=${onClick}>
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
        </button>
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

const Button = ({ label, onClick }) => {
    return html`<button class="button" onClick=${onClick}>${label}</button>`;
};

const Icon = ({ name, color }) => {
    return html`<div class="icon ${color && `color-bg-${color}`}"><i class="fa-solid fa-${name}"></i></div>`;
}

render(h(App), document.body);