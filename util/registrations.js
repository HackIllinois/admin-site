export function formatCamelCase(camelCase) {
    const [firstWord, ...remainingWords] = camelCase.split(/(?=[A-Z])/)
    const captialFirstWord = firstWord[0].toUpperCase() + firstWord.slice(1)
    return (captialFirstWord + " " + remainingWords.join(" ")).trim()
}

// combines registration, decision, rsvp, and checkin data into one object
export function addOtherData(registrations, decisions, rsvps, checkins) {
    // create a map: { [userId]: { ... } } to avoid looping through the potentially huge arrays later
    const map = {}
    registrations.forEach(({ id }) => (map[id] = {}))

    if (decisions) {
        decisions.forEach((decision) => {
            const { id, status, wave, finalized } = decision
            map[id] = { ...map[id], status, wave, finalized }
        })
    }

    if (rsvps) {
        rsvps.forEach((rsvp) => {
            const {
                id,
                isAttending,
                dietaryRestrictions,
                hasDisability,
                shirtSize,
            } = rsvp
            map[id] = {
                ...map[id],
                isAttending,
                dietaryRestrictions,
                hasDisability,
                shirtSize,
            }
        })
    }

    if (checkins) {
        checkins.forEach((userId) => {
            map[userId] = { ...map[userId], checkedIn: true }
        })
    }

    // for each registration, create a new registration object with the decision, rsvp, and checkin columns added
    return (registrations || []).map((registration) => ({
        ...registration,
        ...map[registration.id],
    }))
}

export function formatRegistrationValue(value) {
    if (typeof value === "object") {
        return JSON.stringify(value, null, 2)
    }
    return String(value)
}

// the api returns the registrations with the keys in alphabetical order
// so we order the keys with certain keys coming first to improve readability of table
const orderedKeys = [
    "id",
    "status",
    "wave",
    "finalized",
    "isAttending",
    "checkedIn",
    "firstName",
    "lastName",
]
export function getColumnKeys(registrations) {
    // we add all the keys not present in KEY_ORDER to the end (since we don't care about where they go)
    registrations.forEach((registration) => {
        Object.keys(registration).forEach((key) => {
            if (!orderedKeys.includes(key)) {
                orderedKeys.push(key)
            }
        })
    })

    return orderedKeys
}

export function filterRegistrations(registrations, filters) {
    return registrations.filter((registration) => {
        // if any of the column values don't match the corresponding filter, then we remove the whole registeration
        for (const { columnKey, value, multiple, exact, invert } of filters) {
            const areEqual = (val1, val2) =>
                exact ? val1 === val2 : val1.includes(val2)
            const invertIfNecessary = (condition) =>
                invert ? !condition : condition
            const columnValue = String(registration[columnKey]).toLowerCase()
            const filterValues = (multiple ? value.split(",") : [value]).map(
                (val) => val.trim().toLowerCase(),
            ) // trimming to support ", " separator instead of just ","

            // If the column value does not match any of the values in this filter, remove this registration
            if (
                invertIfNecessary(
                    filterValues.every((val) => !areEqual(columnValue, val)),
                )
            ) {
                return false
            }
        }
        return true
    })
}
