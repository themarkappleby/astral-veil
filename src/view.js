const App = ({ state, pushView, popView }) => {
    const views = {
        menu: () => {
            return {
                title: 'Menu',
                children: html`
                    <${List}>
                        <${ListItem} icon="globe" text="World" onClick=${() => pushView({id: 'world'})} />
                        <${ListItem} icon="gear" text="Settings" onClick=${() => {}} />
                    </${List}>
                `,
            }
        },
        world: () => {
            return {
                title: 'World',
                children: html`
                    <${List} title="Stockpile">
                        ${Object.entries(state.stockpile.reduce((acc, item) => {
                            const type = item.entity.type;
                            if (!acc[type]) acc[type] = [];
                            acc[type].push(item);
                            return acc;
                        }, {})).map(([type, items]) => {
                            const title = toTitleCase(type);
                            const total = items.reduce((acc, item) => acc + item.count, 0);
                            return html`
                                <${ListItem} onClick=${() => pushView({id: 'stockpile', title, type})} icon="box" text="${title}" secondaryText="${total}" />
                            `;
                        })}
                    </${List}>
                    <${List} title="Environment">
                        ${state.entities.sort((a, b) => a.dist - b.dist).map(e => html`
                            <${ListItem}
                                icon="${getEntityIcon(e.type)}"
                                text="${e.name}"
                                detail="${e.status}"
                                secondaryText="${e.dist ? `Dist ${e.dist}` : 'At base'}"
                                percent=${e.percent}
                                onClick=${() => {
                                    if (e.type === 'humanoid') {
                                        pushView({id: 'humanoid', humanoid: e});
                                    }
                                }}
                            />
                        `)}
                        <${ListItem} text="Explore" secondaryText="${html`<${Toggle} />`}" />
                    </${List}>
                `,
            }
        },
        stockpile: ({ title, type }) => {
            const items = state.stockpile.filter(item => item.entity.type === type);
            return {
                title: title || 'Stockpile',
                children: html`
                    <${List}>
                        ${items.map(item => html`
                            <${ListItem} icon="box" text="${item.count === 1 ? item.entity.singularName : item.entity.pluralName}" secondaryText="${item.count}" onClick=${() => pushView({id: 'entity', entity: item.entity})} />
                        `)}
                    </${List}>
                `
            }
        },
        entity: ({ entity }) => {
            return {
                title: entity.singularName || 'Entity',
                children: html`
                    <${List}>
                        ${entity.description && html`<${ListItem} text="${entity.description}" />`}
                        ${Object.entries(entity).map(([key, value]) => {
                            if (key === 'singularName' || key === 'pluralName' || key === 'description') return;
                            return html`
                                <${ListItem} text="${toTitleCase(key)}" secondaryText="${toTitleCase(value)}" />
                            `;
                        })}
                    </${List}>
                `,
            }
        },
        humanoid: ({ humanoid }) => {
            return {
                title: humanoid.name || 'Humanoid',
                children: html`
                    <${List} title="Queue">
                        <${ListItem} text="Currently" detail="Idle" />
                        <${ListItem} text="Up next" detail="NA" />
                    </${List}>
                    <${List} title="Condition">
                        <${ListItem} icon="heart" text="Health" detail="Stable" secondaryText="90%" percent="90" onClick=${() => {}} />
                        <${ListItem} icon="brain" text="Mood" detail="Content" secondaryText="63%" percent="63" onClick=${() => {}} />
                        <${ListItem} icon="bed" text="Rest" detail="Rested" secondaryText="100%" percent="100" onClick=${() => {}} />
                        <${ListItem} icon="utensils" text="Hunger" detail="Satisfied" secondaryText="98%" percent="98" onClick=${() => {}} />
                        <${ListItem} icon="person-running" text="Recreation" detail="Satisfied" secondaryText="80%" percent="80" onClick=${() => {}} />
                        <${ListItem} icon="couch" text="Comfort" detail="Comfortable" secondaryText="80%" percent="80" onClick=${() => {}} />
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
                        <${ListItem} icon="face-smile" text="Fritz" secondaryText="Friend" percent="78" onClick=${() => {}} />
                        <${ListItem} icon="face-frown" text="Murphy" secondaryText="Detests" percent="12" onClick=${() => {}} />
                    </${List}>
                `,
            }
        }
    }

    return html`
        <div class="container">
            <div class="app" style="transform: translateX(${state.viewStack.findIndex(v => v.id === state.activeView.id) * -100}%)">
                ${state.viewStack.map((viewData, index) => {
                    const view = views[viewData.id](viewData);
                    const lastViewData = state.viewStack[index - 1];
                    const lastView = lastViewData ? views[lastViewData.id](lastViewData) : null;
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
                            <button onClick=${() => state.setIsPaused(!state.isPaused)}>
                                <i class="fa-solid fa-${state.isPaused ? 'play' : 'pause'}"></i>
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
