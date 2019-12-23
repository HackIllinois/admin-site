export function formatCamelCase(camelCase) {
  const [firstWord, ...remainingWords] = camelCase.split(/(?=[A-Z])/);
  const captialFirstWord = firstWord[0].toUpperCase() + firstWord.slice(1);
  return (captialFirstWord + ' ' + remainingWords.join(' ')).trim();
}

export function addDecisionsColumn(registerations, decisions) {
  const decisionsMap = {};
  decisions.forEach(decision => decisionsMap[decision.id] = decision.status);

  return registerations.map(registeration => 
    Object.assign({}, registeration, { decisionStatus: decisionsMap[registeration.id]})
  );
}

function removeFirstAndLastLine(str) {
  return str.split('\n').map(line => line.trim()).slice(1, -1).join('\n');
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

function formatUser(user) {
  const formattedUser = {};
  Object.entries(user).forEach(([key, value]) => {
    formattedUser[key] = formatUserValue(value);
  });
  return formattedUser;
}

export function formatRegistrations(registrations) {
  return registrations.map(formatUser);
}

// the api returns the registrations with the keys in alphabetical order
// so we order the keys with certain keys coming first to improve readability of table
const orderedKeys = ['id', 'decisionStatus', 'firstName', 'lastName', 'email'];
export function getColumnKeys(registrations) {
  // we add all the keys not present in KEY_ORDER to the end (since we don't care about where they go)
  registrations.forEach(registration => {
    Object.keys(registration).forEach(key => {
      if (!orderedKeys.includes(key)) {
        orderedKeys.push(key);
      }
    });
  });

  return orderedKeys;
}

export function filterRegistrations(registrations, filters) {
  return registrations.filter(registration => {
    // if any of the column values don't match the corresponding filter, then we remove the whole registeration
    for (const [columnKey, filterValue] of filters) {
      if (!String(registration[columnKey]).toLowerCase().includes(filterValue.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}