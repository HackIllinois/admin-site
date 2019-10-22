import sampleData from './sample-data.json';

export function formatCamelCase(camelCase) {
  const [firstWord, ...remainingWords] = camelCase.split(/(?=[A-Z])/);
  const captialFirstWord = firstWord[0].toUpperCase() + firstWord.slice(1);
  return captialFirstWord + ' ' + remainingWords.join(' ');
}

export function getRegistrations() {
  // For now, we're creating copies of sample data; will eventually be replaced with API request
  return new Promise(resolve => {
    sampleData.registrations = sampleData.registrations.map(formatUser);
    let registrations = [];
    for (let i = 0; i < 500; i++) {
      registrations = registrations.concat(JSON.parse(JSON.stringify(sampleData.registrations)));
      registrations[2 * i].id = 'github' + String(2 * i + 1).padStart(7, '0');
      registrations[2 * i + 1].id = 'github' + String(2 * i + 2).padStart(7, '0');
    }
    resolve(registrations);
  });
}

function formatUser(user) {
  const formattedUser = {};
  Object.entries(user).forEach(([key, value]) => {
    formattedUser[key] = formatUserValue(value);
  });
  return formattedUser;
}

function formatUserValue(value) {
  if (typeof value == 'string' || typeof value == 'number') {
    return value;
  } else if (Array.isArray(value)) {
    if (value.length === 1) {
      return removeFirstAndLastLine(JSON.stringify(value[0], null, 2))
    }
  }
  return JSON.stringify(value, null, 2);
}

function removeFirstAndLastLine(str) {
  return str.split('\n').map(line => line.trim()).slice(1, -1).join('\n');
}