const API = 'https://adonix.hackillinois.org'

async function request(method, endpoint, body) {
    const result = await fetch(API + endpoint, {
        method,
        headers: {
            Authorization: localStorage.getItem('token'),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    if (result.ok) {
        if (result.status === 204) {
            return {}
        }
        return await result.json()
    }

    const error = await result.json()

    if (
        error.error === 'TokenInvalid' ||
        error.error === 'TokenExpired' ||
        error.error === 'NoToken'
    ) {
        authenticate(window.location.href)
    }

    alert(error.message)
    throw new Error(error.message)
}

export function isAuthenticated() {
    return localStorage.getItem('token')
}

export function authenticate(to, provider = 'google') {
    // `to` is saved in localStorage so that it can be used in the Auth component later
    localStorage.setItem('to', to)

    const redirectURI = `${window.location.origin}/auth/`
    const authURL = `${API}/auth/login/${provider}?redirect=${redirectURI}`
    window.location.replace(authURL)
}

export function getTokenData() {
    const token = localStorage.getItem('token')
    if (token) {
        return JSON.parse(atob(token.split('.')[1]))
    }
    return null
}

export function getRoles() {
    const tokenData = getTokenData()
    return tokenData ? tokenData.roles : []
}

export function getUserId() {
    const tokenData = getTokenData()
    return tokenData ? tokenData.id : ''
}

export function getDecisions() {
    return request('GET', '/decision/filter/').then((res) => res.decisions)
}

export function makeDecision(decisions) {
    return request('PUT', '/admission/update', decisions)
}

export function finalizeDecision(id, finalized = true) {
    return request('POST', '/decision/finalize/', { id, finalized })
}

export function getEvents() {
    return request('GET', '/event/')
        .then((res) => res.events)
        .then((events) => events.filter((event) => !event.isStaff))
}

export function getStaffEvents() {
    return request('GET', '/event/staff/').then((res) => res.events)
}

export function updateEvent(event) {
    return request('PUT', '/event/', event)
}

export function addEvent(event) {
    return request('POST', '/event/', event)
}

export function deleteEvent(eventId) {
    return request('DELETE', `/event/${eventId}/`)
}

export function getEventTracker(eventId) {
    return request('GET', `/event/track/event/${eventId}/`)
}

export function getNotificationTopics() {
    return request('GET', '/notifications/topic/').then((res) => res.topics)
}

export function addNotificationTopic(topic) {
    return request('POST', '/notifications/topic/', { id: topic })
}

export function removeNotificationTopic(topic) {
    return request('DELETE', `/notifications/topic/${topic}/`)
}

export function getNotifications() {
    return request('GET', '/notification/')
}

export async function sendNotification(notification) {
    return await request('POST', '/notification/send/', notification)
}

export function getRegistration(id) {
    return request('GET', `/registration/userid/${id}`)
}

export function getStats() {
    return request('GET', '/stat/')
}

export function getRsvps() {
    return request('GET', '/admission/rsvp/staff/')
}

export function getCheckins() {
    return request('GET', '/checkin/list/').then((res) => res.checkedInUsers)
}

export function getBlob(blobId) {
    return request('GET', `/upload/blobstore/${blobId}/`)
}

export function updateBlob(blobId, data) {
    return request('PUT', `/upload/blobstore/`, { id: blobId, data })
}

export function createBlob(blobId, data) {
    return request('POST', `/upload/blobstore/`, { id: blobId, data })
}

export function getShop() {
    return request('GET', `/shop`)
}

export function getShopQRs(itemId) {
    return request('GET', `/shop/item/qr/${itemId}`)
}

export function createShopItem(
    setName,
    setPrice,
    setIsRaffle,
    setQuantity,
    setImageUrl,
) {
    return request('POST', `/shop/item`, {
        name: setName,
        price: setPrice,
        isRaffle: setIsRaffle,
        quantity: setQuantity,
        imageUrl: setImageUrl,
    })
}

export function updateShopItem(
    itemId,
    setName,
    setPrice,
    setIsRaffle,
    setImageUrl,
) {
    return request('PUT', `/shop/item/${itemId}`, {
        name: setName,
        price: setPrice,
        isRaffle: setIsRaffle,
        imageUrl: setImageUrl,
    })
}
