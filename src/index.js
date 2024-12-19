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
                <${List}>
                    <${ListItem} icon="user" onClick=${() => pushView('jason')} value="Dist 2">Jason</${ListItem}>
                    <${ListItem} icon="user" value="Dist 2">Sarah</${ListItem}>
                    <${ListItem} icon="user" value="Dist 3">Gordon</${ListItem}>
                </${List}>
                <${Button} label="Explore" />
            `,
        },
        jason: {
            title: 'Jason',
            children: html`
                <${List}>
                    <${ListItem}>Health</${ListItem}>
                    <${ListItem}>Inventory</${ListItem}>
                    <${ListItem}>Backstory</${ListItem}>
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

const ListItem = ({ icon, children, value, onClick }) => {
    return html`
        <button class="list-item" onClick=${onClick}>
            <div class="list-item-left">
                ${icon ? html`<${Icon} name=${icon} />` : ''}
                <div>${children}</div>
            </div>
            <div class="list-item-right">
                ${value ? html`<div class="list-item-value">${value}</div>` : ''}
                ${onClick ? html`<div class="list-item-arrow"><i class="fa-solid fa-chevron-right"></i></div>` : ''}
            </div>
        </button>
    `
}

const Button = ({ label, onClick }) => {
    return html`<button class="button" onClick=${onClick}>${label}</button>`;
};

const Icon = ({ name, color = 1 }) => {
    return html`<div class="icon icon-color-${color}"><i class="fa-solid fa-${name}"></i></div>`;
}

render(h(App), document.body);