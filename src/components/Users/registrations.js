export function formatCamelCase(camelCase) {
  const [firstWord, ...remainingWords] = camelCase.split(/(?=[A-Z])/);
  const captialFirstWord = firstWord[0].toUpperCase() + firstWord.slice(1);
  return (captialFirstWord + ' ' + remainingWords.join(' ')).trim();
}

export function addDecisionColumns(registerations, decisions) {
  // create a map ({userId: [status, wave, finalized]}) to avoid looping through the potentially huge decisions array
  const decisionsMap = {};
  decisions.forEach(decision => {
    const { id, status, wave, finalized } = decision;
    decisionsMap[id] = [status, wave, finalized];
  });

  // for each registration, create a new registration object with the three decisions columns added
  return registerations.map(registeration => {
    const [decisionStatus, wave, finalized] = decisionsMap[registeration.id];
    return Object.assign({}, registeration, { decisionStatus, wave, finalized });
  });
}

export function formatRegistrationValue(value) {
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

// the api returns the registrations with the keys in alphabetical order
// so we order the keys with certain keys coming first to improve readability of table
const orderedKeys = ['id', 'decisionStatus', 'wave', 'finalized', 'firstName', 'lastName', 'email'];
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