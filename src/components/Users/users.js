export function formatCamelCase(camelCase) {
  const [firstWord, ...remainingWords] = camelCase.split(/(?=[A-Z])/);
  const captialFirstWord = firstWord[0].toUpperCase() + firstWord.slice(1);
  return captialFirstWord + ' ' + remainingWords.join(' ');
}


// the registrations data is huge so we don't want to refetch it every time 
let savedRegistrations = [];
export async function getRegistrations(forceRefresh = false) {
  if (savedRegistrations.length > 0 && !forceRefresh) {
    return savedRegistrations;
  }
  const response = await fetch('https://hackillinois-mock-api.netlify.com/registrations.json');
  const registrations = await response.json();
  const formattedRegistrations = registrations.map(formatUser);
  savedRegistrations = formattedRegistrations;
  return formattedRegistrations;
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