const locateClosestEntity = ({
    fromDist,
    properties,
    entities,
}) => {
    let closestEntity = null;
    let minDiff = Infinity;
    for (const entity of entities) {
        if (!entity.delete) {
            const diff = Math.abs(entity.dist - fromDist);
            if (diff < minDiff) {
                const matches = Object.entries(properties).every(([key, value]) => {
                    return get(entity, key) === value
                });
                if (matches) {
                    minDiff = diff;
                    closestEntity = entity;
                }
            }
        }
    }
    return closestEntity;
}

const formatTime = (hour, minute, amPm) => {
 return `${hour}:${minute < 10 ? '0' : ''}${minute} ${amPm}`;
}

const get = (object, path) => {
    return path.split('.').reduce((o, i) => o?.[i], object)
}

const newId = () => {
    return crypto.randomUUID();
}

const getRandom = (from, to) => {
    return Math.floor(Math.random() * (to - from + 1)) + from;
}

const getRandomGender = () => {
    return Math.random() < 0.5 ? 'male' : 'female';
}

const getRandomName = (gender) => {
    const maleNames = ['John', 'Jerry', 'Steve', 'Bob', 'Jason', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'James', 'Robert', 'Michael', 'Charles', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Paul', 'Mark', 'Donald', 'George', 'Kenneth', 'Steven', 'Edward', 'Brian', 'Ronald', 'Anthony', 'Kevin', 'Jason', 'Matthew', 'Gary', 'Timothy', 'Jose', 'Larry', 'Jeffrey', 'Frank', 'Scott', 'Eric', 'Stephen', 'Andrew', 'Raymond', 'Gregory', 'Joshua', 'Jerry', 'Dennis', 'Walter', 'Patrick', 'Peter', 'Harold', 'Douglas', 'Henry', 'Carl', 'Arthur', 'Ryan', 'Roger'];
    const femaleNames = ['Jane', 'Sarah', 'Emily', 'Alice', 'Jessica', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Dorothy', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Kathleen', 'Amy', 'Shirley', 'Angela', 'Helen', 'Brenda', 'Pamela', 'Nicole', 'Helen', 'Samantha', 'Katherine', 'Christine', 'Emma', 'Catherine', 'Virginia', 'Rachel', 'Janet', 'Maria', 'Heather', 'Diane', 'Julie'];
    return gender === 'male' ? maleNames[Math.floor(Math.random() * maleNames.length)] : femaleNames[Math.floor(Math.random() * femaleNames.length)];
}

const getRandomSurname = () => {
    return surnames[Math.floor(Math.random() * surnames.length)];
}

const getDistText = (dist, withSuffix = true) => {
    return dist < 1 ? 'At base' : `${Math.round(dist)}${withSuffix ? ' km' : ''}`;
}

const getActionText = (action, state) => {
    if (!action) return 'Idle';
    const verbMap = {
        walk: 'Walking to',
        eat: 'Eating',
        sleep: 'Sleeping',
        build: 'Building',
        grow: 'Growing',
        explore: 'Exploring',
    }
    const actionTarget = state.entities.find(e => e.id === action.targetId);
    return `${verbMap[action?.name] || 'VERB'} ${actionTarget?.name?.toLowerCase() || ''} ${action?.progress !== undefined ? `${action?.progress?.toFixed(2)}%` : ''}`;
}

const STATUSES = {
    overall: [
        { name: 'Great', min: 90 },
        { name: 'Good', min: 80 },
        { name: 'Average', min: 50 },
        { name: 'Poor', min: 20 },
        { name: 'Terrible', min: 0 },
    ],
    hunger: [
        { name: 'Full', min: 80 },
        { name: 'Satisfied', min: 50 },
        { name: 'Hungry', min: 20 },
        { name: 'Starving', min: 0 },
    ],
    mood: [
        { name: 'Happy', min: 80 },
        { name: 'Content', min: 50 },
        { name: 'Unhappy', min: 30 },
        { name: 'Depressed', min: 0 },
    ],
    rest: [
        { name: 'Rested', min: 50 },
        { name: 'Tired', min: 30 },
        { name: 'Exhausted', min: 0 },
    ],
    health: [
        { name: 'Healthy', min: 50 },
        { name: 'Unwell', min: 20 },
        { name: 'Dying', min: 0 },
    ],
}
const getStatusDesc = (type, value) => {
    return STATUSES[type].find(s => value >= s.min)?.name;
}

const toTitleCase = (str) => {
    if (typeof str !== 'string') return str;
    return str[0].toUpperCase() + str.slice(1);
}
