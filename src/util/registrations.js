export function formatCamelCase(camelCase) {
  const [firstWord, ...remainingWords] = camelCase.split(/(?=[A-Z])/);
  const captialFirstWord = firstWord[0].toUpperCase() + firstWord.slice(1);
  return (captialFirstWord + ' ' + remainingWords.join(' ')).trim();
}

export function addDecisionAndRsvp(registerations, decisions, rsvps) {
  // create a map ({userId: { ... }]}) to avoid looping through the potentially huge arrays
  const map = {};
  decisions.forEach(decision => {
    const { id, status, wave, finalized } = decision;
    map[id] = {status, wave, finalized};
  });
  
  rsvps.forEach(rsvp => {
    const { id, isAttending, dietaryRestrictions, hasDisability } = rsvp;
    map[id] = Object.assign(map[id] || {}, { isAttending, dietaryRestrictions, hasDisability });
  })

  // for each registration, create a new registration object with the decision and rsvp columns added
  return registerations.map(registeration => {
    return Object.assign({}, registeration, map[registeration.id]);
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
const orderedKeys = ['id', 'status', 'wave', 'finalized', 'isAttending', 'firstName', 'lastName'];
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
    for (const { columnKey, value, multiple, exact, invert } of filters) {
      const areEqual = (val1, val2) => exact ? val1 === val2 : val1.includes(val2);
      const invertIfNecessary = condition => invert ? !condition : condition;
      const columnValue = String(registration[columnKey]).toLowerCase();
      const filterValues = (multiple ? value.split(',') : [value])
        .map(val => val.trim().toLowerCase()); // trimming to support ", " separator instead of just ","

      // If the column value does not match any of the values in this filter, remove this registration
      if (invertIfNecessary(filterValues.every(val => !areEqual(columnValue, val)))) {
        return false;
      }
    }
    return true;
  });
}