const App = ({ state, pushView, popView, closeModal, pushModalView, popModalView }) => {
    const views = {
        menu: () => {
            return {
                title: 'Menu',
                children: html`
                    <${List}>
                        <${ListItem} icon="globe" text="World" onClick=${() => pushView({id: 'world'})} />
                        <${ListItem} icon="gear" text="Settings" onClick=${() => pushView({id: 'settings'})} />
                    </${List}>
                `,
            }
        },
        world: () => {
            let lastDist = 0;
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
                            let text = e.count ? (e.count === 1 ? `1 ${e.name.toLowerCase()}` : `${e.count} ${e.pluralName.toLowerCase()}`) : e.name;
                            if (e.surname) {
                                text = `${e.name} ${e.surname}`;
                            }
                            let actionText = null
                            if (e.type === 'humanoid') {
                                actionText = getActionText(e.action, state);
                            } else if (e.type === 'construction') {
                                actionText = Math.round(e.progress) + '% complete';
                            } else if (e.type === 'crop') {
                                actionText = getActionText(e.action, state).replace('Idle', 'Ready to harvest');
                            } else if (e.type === 'location') {
                                actionText = `${e.exploring ? 'Exploring: ' : ''}${Math.round(e.progress || 0)}% explored`;
                            }
                            const distText = getDistText(e?.dist);
                            const distInt = parseInt(getDistText(e?.dist, false)) || 0;
                            // if gap between this e.dist and lastDist is more than 1, add an ListItem with the text "Empty" for the difference
                            const diff = distInt - lastDist;
                            const emptyItems = [];
                            if (diff > 1) {
                                for (let i = 1; i < diff; i++) {
                                    emptyItems.push(html`
                                        <${ListItem} isEmpty text="Empty" secondaryText="${getDistText(i + lastDist)}" />
                                    `);
                                }
                            }
                            lastDist = distInt;
                            return html`
                                ${state.showEmpty ? emptyItems : ''}
                                <${ListItem}
                                    icon="${getEntityIcon(e.type)}"
                                    text="${text}"
                                    detail="${actionText}"
                                    secondaryText="${distText}"
                                    percent=${e?.action?.progress || e?.progress}
                                    onClick=${() => {
                                        if (e.type === 'humanoid') {
                                            pushModalView({id: 'humanoid', entityId: e.id});
                                        } else {
                                            pushModalView({id: 'entity', entityId: e.id});
                                        }
                                    }}
                                />
                            `
                        })}
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
                                'action',
                                'queue',
                                'exploring',
                                'building',
                            ];
                            if (ignore.includes(key) || !key || !value) return;
                            return html`
                                <${ListItem} text="${toTitleCase(key)}" secondaryText="${toTitleCase(value)}" />
                            `;
                        })}
                        ${entity.type === 'location' ? html`
                            <${ListItem} text="Explore" secondaryText="${html`<${Toggle} value=${entity.exploring} onChange=${() => {
                                state.setEntities(state.entities.map(e => e.id === entity.id ? {...e, exploring: !e.exploring} : e));
                            }} />`}" />
                        ` : ''}
                        ${entity.type === 'construction' ? html`
                            <${ListItem} text="Build" secondaryText="${html`<${Toggle} value=${entity.building} onChange=${() => {
                                state.setEntities(state.entities.map(e => e.id === entity.id ? {...e, building: !e.building} : e));
                            }} />`}" />
                            <${ListItem} text="Destroy" isButton onClick=${() => {
                                if (confirm('Are you sure you want to destroy this construction?')) {
                                    state.setEntities(state.entities.map(e => e.id === entity.id ? {...e, dist: -1} : e));
                                    popView();
                                }
                            }} />
                        ` : ''}
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
                        ${construction.description && html`<${ListItem} text="${construction.description}" />`}
                        ${Object.entries(construction).map(([key, value]) => {
                            const ignore = [
                                'name',
                                'description',
                                'pluralName',
                                'id',
                            ];
                            if (ignore.includes(key)) return;
                            return html`
                                <${ListItem} text="${toTitleCase(key)}" secondaryText="${toTitleCase(value)}" />
                            `;
                        })}
                        <${ListItem} text="Build" isButton onClick=${() => {
                            state.setEntities([...state.entities, {
                                ...construction,
                                dist: 0,
                                progress: 0,
                                building: true,
                                id: newId(),
                            }])
                            closeModal();
                        }} />
                    </${List}>
                `,
            }
        },
        humanoid: ({ entityId }) => {
            const humanoid = state.entities.find(e => e.id === entityId);
            const actionText = getActionText(humanoid?.action, state);
            const distText = getDistText(humanoid?.dist);
            return {
                title: `${humanoid.name} ${humanoid.surname}` || 'Humanoid',
                children: html`
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
                        <${ListItem} text="Age" secondaryText="${humanoid.age}" />
                        <${ListItem} text="Gender" secondaryText="${toTitleCase(humanoid.gender)}" />
                        <${ListItem} text="Childhood" secondaryText="Mute" onClick=${() => {}} />
                        <${ListItem} text="Adulthood" secondaryText="Civil servant" onClick=${() => {}} />
                    </${List}>
                    <${List} title="Traits">
                        <${ListItem} text="Lazy" onClick=${() => {}} />
                        <${ListItem} text="Nudist" onClick=${() => {}} />
                    </${List}>
                    <${List} title="Relations">
                        <${ListItem} icon="face-smile" text="Fritz" detail="Friend" secondaryText="78.05%" percent="78" onClick=${() => {}} />
                        <${ListItem} icon="face-frown" text="Murphy" detail="Detests" secondaryText="12.17%" percent="12" onClick=${() => {}} />
                    </${List}>
                `,
            }
        },
        settings : () => {
            return {
                title: 'Settings',
                children: html`
                    <${List}>
                        <${ListItem} text="Show empty entries" secondaryText="${html`<${Toggle} value=${state.showEmpty} onChange=${() => {
                            state.setShowEmpty(!state.showEmpty);
                        }} />`}" />
                    </${List}>
                `,
            }
        },
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
            <div class="time">
                <${List}>
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
                <div class="modal-overlay" onClick=${closeModal} />
                <div class="modal-container">
                    <div class="modal-inner" style="transform: translateX(${Math.min(0, state.modalViewStack.findIndex(v => v.id === state.activeModalView?.id) * -100)}%)">
                        ${state.modalViewStack.map((viewData, index) => {
                            const view = views[viewData.id](viewData);
                            const lastViewData = state.modalViewStack[index - 1];
                            const lastView = lastViewData ? views[lastViewData.id](lastViewData) : null;
                            return html`
                                <${View} title=${view.title} icon=${view.icon} onIconClick=${view.onIconClick} backLabel=${lastView?.title || 'Close'} onBackClick=${() => {
                                    if (lastView) {
                                        popModalView()
                                    } else {
                                        closeModal();
                                    }
                                }}>
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
