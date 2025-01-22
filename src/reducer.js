const DEFAULT_GAME_SPEED = 500;

const initialState = {
    game: {
        speed: DEFAULT_GAME_SPEED,
        time: {
            hour: 7,
            minute: 0,
            amPm: 'AM',
        },
        day: 1,
        entities: [],
    },
    view: {
        stack: [],
        modalStack: [],
        activeView: null,
        activeModalView: null,
    },
    settings: {
        showDistanceMarkers: true,
    },
    log: [],
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'TOGGLE_PAUSE': {
            return {
                ...state,
                game: {
                    ...state.game,
                    speed: state.game.speed === DEFAULT_GAME_SPEED ? 0 : DEFAULT_GAME_SPEED,
                }
            }
        }
        case 'TOGGLE_DISTANCE_MARKERS_SETTING': {
            return {
                ...state,
                settings: {
                    ...state.settings,
                    showDistanceMarkers: !state.settings.showDistanceMarkers,
                }
            }
        }
        case 'INCREASE_TIME': {
            let newHour = state.game.time.hour;
            let newMinute = state.game.time.minute + 1;
            let newAmPm = state.game.time.amPm;
            let newDay = state.game.day;
            if (newMinute > 60) {
                newMinute = 1;
                newHour += 1;
                if (newHour === 12) {
                    newAmPm = newAmPm === 'AM' ? 'PM' : 'AM';
                    if (newAmPm === 'AM') {
                        newDay += 1;
                    }
                } else if (newHour === 13) {
                    newHour = 1;
                }
            }
            return {
                ...state,
                game: {
                    ...state.game,
                    day: newDay,
                    time: {
                        hour: newHour,
                        minute: newMinute,
                        amPm: newAmPm,
                    },
                }
            }
        }
    }
}