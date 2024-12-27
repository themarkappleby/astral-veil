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
                icon: 'plus',
                onIconClick: () => {
                    state.setModalView({id: 'construct'})
                },
                children: html`
                    <${List}>
                        ${state.entities.sort((a, b) => a.dist - b.dist).map(e => {
                            const text = e.count ? (e.count === 1 ? `1 ${e.name.toLowerCase()}` : `${e.count} ${e.pluralName.toLowerCase()}`) : e.name;
                            const actionText = e.type === 'humanoid' ? getActionText(e.action, state) : '';
                            return html`
                                <${ListItem}
                                    icon="${getEntityIcon(e.type)}"
                                    text="${text}"
                                    detail="${actionText}"
                                    secondaryText="${e?.dist ? `Dist ${Math.floor(e.dist)}` : 'At base'}"
                                    percent=${e?.action?.progress}
                                    onClick=${() => {
                                        if (e.type === 'humanoid') {
                                            pushView({id: 'humanoid', entityId: e.id});
                                        } else if (e.type === 'food') {
                                            pushView({id: 'entity', entityId: e.id});
                                        }
                                    }}
                                />
                            `
                        })}
                        <${ListItem} text="Explore" secondaryText="${html`<${Toggle} />`}" />
                    </${List}>
                `,
            }
        },
        construct: () => {
            return {
                title: 'Construct',
                children: html`
                    <${List}>
                        <${ListItem} icon="building" text="Rice field" onClick=${() => {}} isButton secondaryText="${html`<i class="fa-solid fa-plus" />`}" />
                        <${ListItem} icon="building" text="Corn field" onClick=${() => {}} isButton secondaryText="${html`<i class="fa-solid fa-plus" />`}" />
                        <${ListItem} icon="building" text="Potato field" onClick=${() => {}} isButton secondaryText="${html`<i class="fa-solid fa-plus" />`}" />
                    </${List}>
                `,
            }
        },
        entity: ({ entityId }) => {
            const entity = state.entities.find(e => e.id === entityId);
            return {
                title: entity.name || 'Entity',
                children: html`
                    <${List}>
                        ${entity.description && html`<${ListItem} text="${entity.description}" />`}
                        ${Object.entries(entity).map(([key, value]) => {
                            const ignore = [
                                'name',
                                'pluralName',
                                'description',
                                'id',
                                'queue',
                            ];
                            if (ignore.includes(key)) return;
                            return html`
                                <${ListItem} text="${toTitleCase(key)}" secondaryText="${toTitleCase(value)}" />
                            `;
                        })}
                    </${List}>
                `,
            }
        },
        humanoid: ({ entityId }) => {
            const humanoid = state.entities.find(e => e.id === entityId);
            const actionText = getActionText(humanoid?.action, state);
            const dist = humanoid?.dist ? `Dist ${Math.floor(humanoid.dist)}` : 'At base';
            return {
                title: humanoid.name || 'Humanoid',
                children: html`
                    <${List} title="Currently">
                        ${humanoid?.action ? html`
                            <${ListItem} icon="face-smile" text="Currently" detail="${actionText}" percent="${humanoid.action?.progress || 0}" secondaryText="${dist}" />
                        ` : html`
                            <${ListItem} icon="face-smile" text="Currently" detail="Idle" secondaryText="${dist}" />
                        `}
                    </${List}>
                    <${List} title="Condition">
                        <${ListItem}
                            text="Overall"
                            icon="face-smile"
                            detail="${getStatusDesc('overall', humanoid.overall)}"
                            secondaryText="${Math.round(humanoid.overall)}%"
                            percent="${humanoid.overall}"
                        />
                        <${ListItem}
                            text="Health"
                            icon="heart"
                            detail="${getStatusDesc('health', humanoid.health)}"
                            secondaryText="${Math.round(humanoid.health)}%"
                            percent="${humanoid.health}"
                            onClick=${() => {}}
                        />
                        <${ListItem}
                            text="Mood"
                            icon="brain"
                            detail="${getStatusDesc('mood', humanoid.mood)}"
                            secondaryText="${Math.round(humanoid.mood)}%"
                            percent="${humanoid.mood}"
                            onClick=${() => {}}
                        />
                        <${ListItem}
                            text="Rest"
                            icon="bed"
                            detail="${getStatusDesc('rest', humanoid.rest)}"
                            secondaryText="${Math.round(humanoid.rest)}%"
                            percent="${humanoid.rest}"
                            onClick=${() => {}}
                        />
                        <${ListItem}
                            text="Hunger"
                            icon="utensils"
                            detail="${getStatusDesc('hunger', humanoid.hunger)}"
                            secondaryText="${Math.round(humanoid.hunger)}%"
                            percent="${humanoid.hunger}"
                            onClick=${() => {}}
                        />
                        <${ListItem}
                            text="Recreation"
                            icon="person-running"
                            detail="Satisfied"
                            secondaryText="80%"
                            percent="80"
                            onClick=${() => {}}
                        />
                        <${ListItem}
                            text="Comfort"
                            icon="couch"
                            detail="Comfortable"
                            secondaryText="80%"
                            percent="80"
                            onClick=${() => {}}
                        />
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

    const bakedModalView = views?.[state?.modalView?.id]?.()

    return html`
        <div class="container">
            <div class="app" style="transform: translateX(${state.viewStack.findIndex(v => v.id === state.activeView.id) * -100}%)">
                ${state.viewStack.map((viewData, index) => {
                    const view = views[viewData.id](viewData);
                    const lastViewData = state.viewStack[index - 1];
                    const lastView = lastViewData ? views[lastViewData.id](lastViewData) : null;
                    return html`
                        <${View} title=${view.title} icon=${view.icon} onIconClick=${view.onIconClick} backLabel=${lastView?.title} onBackClick=${() => popView()}>
                            ${view.children}
                        </${View}>
                    `;
                })}
            </div>
            <div class="goal">
                <${List}>
                    <${ListItem} icon="flag-checkered" text="Current goal" detail="Plant a rice field" />
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
            ${bakedModalView ? html`
                <div class="modal">
                    <div class="modal-overlay" onClick=${() => state.setModalView(null)} />
                    <div class="modal-content">
                        <header class="modal-header">
                            <button class="modal-cancel" onClick=${() => state.setModalView(null)}>Cancel</button>
                            <h3 class="modal-title">${bakedModalView.title}</h3>
                        </header>
                        ${bakedModalView.children}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
};

render(h(withController(App)), document.body);
