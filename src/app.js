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
                <${List} title="Stockpile">
                    ${state.stockpile.map((category) => {
                        const total = category.items.reduce((acc, item) => acc + item.count, 0);
                        const percent = Math.round(total / category.capacity * 100);
                        return html`
                            <${ListItem} icon="box" percent=${percent} right="${total}" onClick=${() => {}}>${category.name}</${ListItem}>
                        `;
                    })}
                </${List}>
                <${List} title="Base">
                    ${state.entities.filter(e => !e.dist).map(e => html`
                        <${ListItem}
                            icon="${getEntityIcon(e.type)}"
                            color="${e.type === 'colonist' ? '11' : ''}"
                            onClick=${() => {
                                if (e.id === 1) {
                                    // TODO: Make this dynamic
                                    pushView('jason');
                                }
                            }}
                        >
                            ${e.name}${e.status ? `: ${e.status}` : ''}
                        </${ListItem}>
                    `)}
                </${List}>
                <${List} title="Surroundings">
                    ${state.entities.filter(e => e.dist).sort((a, b) => a.dist - b.dist).map(e => html`
                        <${ListItem}
                            icon="${getEntityIcon(e.type)}"
                            percent=${e.percent}
                            color="${e.type === 'colonist' ? '11' : ''}"
                            onClick=${() => {}}
                            right="Dist ${e.dist}"
                        >
                            ${e.name}${e.status ? `: ${e.status}` : ''}
                        </${ListItem}>
                    `)}
                    <${ListItem} right=${html`<${Toggle} />`}>Explore</${ListItem}>
                </${List}>
            `,
        },
        jason: {
            title: 'Jason',
            children: html`
                <${List}>
                    <${ListItem} right="Eating bartlett pear" onClick=${() => {}}>Currently</${ListItem}>
                    <${ListItem} right="Chop birch tree (dist 6)" onClick=${() => {}}>Up next</${ListItem}>
                </${List}>
                <${List} title="Condition">
                    <${ListItem} icon="heart" right="90%" onClick=${() => {}} percent="90">Health</${ListItem}>
                    <${ListItem} icon="face-meh" right="63%" onClick=${() => {}} percent="63">Mood</${ListItem}>
                    <${ListItem} icon="bed" onClick=${() => {}} right="100%" percent="100">Rest</${ListItem}>
                    <${ListItem} icon="utensils" onClick=${() => {}} right="98%" percent="98">Hunger</${ListItem}>
                    <${ListItem} icon="person-running" onClick=${() => {}} right="80%" percent="80">Recreation</${ListItem}>
                </${List}>
                <${List} title="Details">
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
                    <${ListItem}>
                        <div class="status">
                            <${Stack}>
                                <button>
                                    <i class="fa-solid fa-pause"></i>
                                </button>
                                <div>${state.hour}:${state.minute < 10 ? '0' : ''}${state.minute} ${state.amPm}</div>
                            </${Stack}>
                            <div>Summer, day ${state.day}</div>
                            <div>Sunny, 23 °C</div>
                        </div>
                    </${ListItem}>
                </${List}>
            </div>
        </div>
    `;
};

render(h(withState(App)), document.body);