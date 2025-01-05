const initialState = {
    game: {
        time: {
            hour: 7,
            minute: 0,
            amPm: 'AM',
        },
        day: 1,
        entities: [],
        speed: {
            current: 500,
            paused: false,
        },
    },
    view: {
        stack: [],
        modalStack: [],
        activeView: null,
        activeModalView: null,
    },
    settings: {
        showDistanceMarkers: true,
    }
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'TOGGLE_PAUSE': {
            return {
                ...state,
                game: {
                    ...state.game,
                    speed: {
                        ...state.game.speed,
                        paused: !state.game.speed.paused,
                    },
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