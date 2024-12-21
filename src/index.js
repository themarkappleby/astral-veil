const App = ({ state, pushView, popView }) => {
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
                            <div>Summer, day ${state.day}</div>
                            <div>${state.hour}:${state.minute < 10 ? '0' : ''}${state.minute} ${state.amPm}</div>
                            <div>Sunny, 23 °C</div>
                        </div>
                    </${ListItem}>
                </${List}>
                <${List} title="Stockpile">
                    ${state.stockpile.map((category) => {
                        const total = category.items.reduce((acc, item) => acc + item.count, 0);
                        const percent = Math.round(total / category.capacity * 100);
                        return html`
                            <${ListItem} icon="box" percent=${percent} onClick=${() => {}}>${category.name}: ${total}</${ListItem}>
                        `;
                    })}
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
                <${List}>
                    <${ListItem} right="Eating bartlett pear">Current job</${ListItem}>
                    <${ListItem} right="Chop birch tree">Next job</${ListItem}>
                </${List}>
                <${List}>
                    <${ListItem} icon="heart" onClick=${() => {}}>Health</${ListItem}>
                    <${ListItem} icon="user" onClick=${() => {}}>Jobs</${ListItem}>
                    <${ListItem} icon="box" onClick=${() => {}}>Inventory</${ListItem}>
                    <${ListItem} icon="book" onClick=${() => {}}>Backstory</${ListItem}>
                </${List}>
            `,
        }
    }

    return html`
        <div class="container">
            <div class="app" style="transform: translateX(${state.viewStack.indexOf(state.activeView) * -100}%)">
                ${state.viewStack.map((viewId, index) => {
                    const view = views[viewId];
                    const lastViewId = state.viewStack[index - 1];
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

render(h(withState(App)), document.body);