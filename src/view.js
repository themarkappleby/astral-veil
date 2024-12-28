const App = ({ state, pushView, popView, pushModalView, popModalView }) => {
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
                    pushModalView({id: 'constructMenu'})
                },
                children: html`
                    <${List}>
                        ${state.entities.sort((a, b) => a.dist - b.dist).map(e => {
                            if (e.dist === -1) return;
                            const text = e.count ? (e.count === 1 ? `1 ${e.name.toLowerCase()}` : `${e.count} ${e.pluralName.toLowerCase()}`) : e.name;
                            const actionText = e.type === 'humanoid' ? getActionText(e.action, state) : '';
                            const distText = getDistText(e?.dist);
                            return html`
                                <${ListItem}
                                    icon="${getEntityIcon(e.type)}"
                                    text="${text}"
                                    detail="${actionText}"
                                    secondaryText="${distText}"
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
        constructMenu: () => {
            return {
                title: 'Construct',
                children: html`
                    <${List}>
                        ${state.availableConstruction.map(c => html`
                            <${ListItem} icon="${getEntityIcon(c.type)}" text="${c.name}" onClick=${() => pushModalView({id: 'constructItem', constructId: c.id})} />
                        `)}
                    </${List}>
                `,
            }
        },
        constructItem: ({ constructId }) => {
            const construction = state.availableConstruction.find(c => c.id === constructId);
            return {
                title: construction.name,
                children: html`
                    <${List}>
                        ${Object.entries(construction).map(([key, value]) => {
                            return html`
                                <${ListItem} text="${toTitleCase(key)}" secondaryText="${toTitleCase(value)}" />
                            `;
                        })}
                        <${ListItem} text="Build" isButton onClick=${() => {}} />
                    </${List}>
                `,
            }
        },
        entity: ({ entityId }) => {
            const entity = state.entities.find(e => e.id === entityId);
            return {
                title: entity?.name || 'Entity',
                children: html`
                    <${List}>
                        ${entity?.description && html`<${ListItem} text="${entity.description}" />`}
                        <${ListItem} text="Dist" secondaryText="${getDistText(entity?.dist, false)}" />
                        ${Object.entries(entity).map(([key, value]) => {
                            const ignore = [
                                'name',
                                'dist',
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
            const distText = getDistText(humanoid?.dist);
            return {
                title: humanoid.name || 'Humanoid',
                children: html`
                    <${List} title="Currently">
                        ${humanoid?.action ? html`
                            <${ListItem} icon="face-smile" text="Currently" detail="${actionText}" percent="${humanoid.action?.progress || 0}" secondaryText="${distText}" />
                        ` : html`
                            <${ListItem} icon="face-smile" text="Currently" detail="Idle" secondaryText="${distText}" />
                        `}
                    </${List}>
                    <${List} title="Condition">
                        <${ListItem}
                            text="Overall"
                            icon="face-smile"
                            detail="${getStatusDesc('overall', humanoid?.overall)}"
                            secondaryText="${humanoid?.overall?.toFixed(2)}%"
                            percent="${humanoid?.overall}"
                        />
                        <${ListItem}
                            text="Health"
                            icon="heart"
                            detail="${getStatusDesc('health', humanoid.health)}"
                            secondaryText="${humanoid.health.toFixed(2)}%"
                            percent="${humanoid.health}"
                            onClick=${() => {}}
                        />
                        <${ListItem}
                            text="Mood"
                            icon="brain"
                            detail="${getStatusDesc('mood', humanoid.mood)}"
                            secondaryText="${humanoid.mood.toFixed(2)}%"
                            percent="${humanoid.mood}"
                            onClick=${() => {}}
                        />
                        <${ListItem}
                            text="Rest"
                            icon="bed"
                            detail="${getStatusDesc('rest', humanoid.rest)}"
                            secondaryText="${humanoid.rest.toFixed(2)}%"
                            percent="${humanoid.rest}"
                            onClick=${() => {}}
                        />
                        <${ListItem}
                            text="Hunger"
                            icon="utensils"
                            detail="${getStatusDesc('hunger', humanoid.hunger)}"
                            secondaryText="${humanoid.hunger.toFixed(2)}%"
                            percent="${humanoid.hunger}"
                            onClick=${() => {}}
                        />
                        <${ListItem}
                            text="Recreation"
                            icon="person-running"
                            detail="Satisfied"
                            secondaryText="80.00%"
                            percent="80"
                            onClick=${() => {}}
                        />
                        <${ListItem}
                            text="Comfort"
                            icon="couch"
                            detail="Comfortable"
                            secondaryText="80.00%"
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
                    <${ListItem} icon="flag-checkered" text="Current goal" detail="Plant a cucumber patch" />
                    <${ListItem}  text="${html`
                        <${Stack}>
                            <button onClick=${() => state.setIsPaused(!state.isPaused)}>
                                <i class="fa-solid fa-${state.isPaused ? 'play' : 'pause'}"></i>
                            </button>
                            <div>${state.hour}:${state.minute < 10 ? '0' : ''}${state.minute} ${state.amPm}</div>
                            <button onClick=${() => {
                                state.setGameSpeed(state.gameSpeed === 1 ? 0.01 : 1);
                            }}>
                                <i class="fa-solid fa-${state.gameSpeed === 1 ? 'forward' : 'forward-fast'}"></i>
                            </button>
                        </${Stack}>
                    `}" secondaryText="Summer, day ${state.day}" />
                </${List}>
            </div>
            <div class="modal ${state.modalVisible ? 'modal--active' : 'modal--inactive'}">
                <div class="modal-overlay" onClick=${() => {
                    state.setModalVisible(false);
                    setTimeout(() => {
                        state.setActiveModalView(null);
                        state.setModalViewStack([]);
                    }, 200);
                }} />
                <div class="modal-container">
                    <div class="modal-inner" style="transform: translateX(${Math.min(0, state.modalViewStack.findIndex(v => v.id === state.activeModalView?.id) * -100)}%)">
                        ${state.modalViewStack.map((viewData, index) => {
                            const view = views[viewData.id](viewData);
                            const lastViewData = state.modalViewStack[index - 1];
                            const lastView = lastViewData ? views[lastViewData.id](lastViewData) : null;
                            return html`
                                <${View} title=${view.title} icon=${view.icon} onIconClick=${view.onIconClick} backLabel=${lastView?.title} onBackClick=${() => popModalView()}>
                                    ${view.children}
                                </${View}>
                            `;
                        })}
                    </div>
                </div>
            </div>
        </div>
    `;
};

render(h(withController(App)), document.body);
