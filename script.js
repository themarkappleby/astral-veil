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
                    <${ListItem} onClick=${() => pushView('world')}>World</${ListItem}>
                    <${ListItem}>Settings</${ListItem}>
                </${List}>
            `,
        },
        world: {
            title: 'World',
            children: html`
                <${List}>
                    <${ListItem} onClick=${() => pushView('jason')}>Jason</${ListItem}>
                    <${ListItem}>Sarah</${ListItem}>
                    <${ListItem}>Gordon</${ListItem}>
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
                ${backLabel ? html`<button class="view-back" onClick=${onBackClick}>${'<'} ${backLabel}</button>` : ''}
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

const ListItem = ({ children, onClick }) => {
    return html`
        <button class="list-item" onClick=${onClick}>
            ${children}
            <div class="list-item-arrow">${'>'}</div>
        </button>
    `
}

const Button = ({ label, onClick }) => {
    return html`<button class="button" onClick=${onClick}>${label}</button>`;
};

render(h(App), document.body);