const App = ({ state, pushView, popView }) => {
    const views = {
        menu: {
            title: 'Menu',
            children: html`
                <${List}>
                    <${ListItem} icon="globe" text="World" onClick=${() => pushView('world')} />
                    <${ListItem} icon="gear" text="Settings" onClick=${() => {}} />
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
                            <${ListItem} icon="box" text="${category.name}" percent=${percent} secondaryText="${total}" onClick=${() => {}} />
                        `;
                    })}
                </${List}>
                <${List} title="Environment">
                    ${state.entities.sort((a, b) => a.dist - b.dist).map(e => html`
                        <${ListItem}
                            icon="${getEntityIcon(e.type)}"
                            iconColor="${e.type === 'colonist' ? '11' : ''}"
                            text="${e.name}"
                            detail="${e.status}"
                            secondaryText="${e.dist ? `Dist ${e.dist}` : 'At base'}"
                            percent=${e.percent}
                            onClick=${() => {
                                if (e.id === 1) {
                                    // TODO: Make this dynamic
                                    pushView('jason');
                                }
                            }}
                        />
                    `)}
                    <${ListItem} text="Explore" secondaryText="${html`<${Toggle} />`}" />
                </${List}>
            `,
        },
        jason: {
            title: 'Jason',
            children: html`
                <${List} title="Queue">
                    <${ListItem} text="Currently" detail="Eating bartlett pear" onClick=${() => {}} />
                    <${ListItem} text="Up next" detail="Chop birch tree" secondaryText="Dist 6" onClick=${() => {}} />
                </${List}>
                <${List} title="Condition">
                    <${ListItem} icon="heart" text="Health" secondaryText="90%" percent="90" onClick=${() => {}} />
                    <${ListItem} icon="face-meh" text="Mood" secondaryText="63%" percent="63" onClick=${() => {}} />
                    <${ListItem} icon="bed" text="Rest" secondaryText="100%" percent="100" onClick=${() => {}} />
                    <${ListItem} icon="utensils" text="Hunger" secondaryText="98%" percent="98" onClick=${() => {}} />
                    <${ListItem} icon="person-running" text="Recreation" secondaryText="80%" percent="80" onClick=${() => {}} k/>
                </${List}>
                <${List} title="Configuration">
                    <${ListItem} icon="user-gear" text="Jobs" onClick=${() => {}} />
                    <${ListItem} icon="box" text="Inventory" onClick=${() => {}} />
                </${List}>
                <${List} title="Details">
                    <${ListItem} text="Name" secondaryText="Jason 'Southpaw' Douglas" />
                    <${ListItem} text="Age" secondaryText="24" />
                    <${ListItem} text="Gender" secondaryText="Male" />
                    <${ListItem} text="Childhood" secondaryText="Mute" onClick=${() => {}} />
                    <${ListItem} text="Adulthood" secondaryText="Civil servant" onClick=${() => {}} />
                </${List}>
                <${List} title="Traits">
                    <${ListItem} text="Lazy" onClick=${() => {}} />
                    <${ListItem} text="Nudist" onClick=${() => {}} />
                </${List}>
                <${List} title="Relations">
                    <${ListItem} text="Fritz" secondaryText="Friend" percent="78" onClick=${() => {}} />
                    <${ListItem} text="Murphy" secondaryText="Detests" percent="12" onClick=${() => {}} />
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
                    <${ListItem} icon="flag-checkered" text="Current goal" detail="Collect wood" secondaryText="1 of 10" percent="10" />
                    <${ListItem}  text="${html`
                        <${Stack}>
                            <button>
                                <i class="fa-solid fa-pause"></i>
                            </button>
                            <div>${state.hour}:${state.minute < 10 ? '0' : ''}${state.minute} ${state.amPm}</div>
                        </${Stack}>
                    `}" secondaryText="Summer, day ${state.day}" />
                </${List}>
            </div>
        </div>
    `;
};

render(h(withController(App)), document.body);
