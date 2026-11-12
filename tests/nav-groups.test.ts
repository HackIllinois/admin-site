import assert from "node:assert/strict"
import { test } from "node:test"
import {
    NAV_GROUPS,
    groupRoutes,
    initialsOf,
    isRouteActive,
} from "../util/nav-groups"

const sample = [
    { path: "/a", name: "A", group: "system" as const },
    { path: "/b", name: "B", group: "people" as const },
    { path: "/c", name: "C", group: "people" as const },
]

test("groupRoutes follows group order and keeps route order inside a group", () => {
    const grouped = groupRoutes(sample)
    assert.deepEqual(
        grouped.map((g) => g.id),
        ["people", "system"],
    )
    assert.deepEqual(
        grouped[0].routes.map((r) => r.name),
        ["B", "C"],
    )
})

test("groupRoutes drops empty groups", () => {
    assert.equal(groupRoutes([]).length, 0)
})

test("NAV_GROUPS has the four labels from the design", () => {
    assert.deepEqual(
        NAV_GROUPS.map((g) => g.label),
        ["People", "Event", "Partners & Shop", "System"],
    )
})

test("isRouteActive matches the route and its sub pages only", () => {
    assert.equal(isRouteActive("/events", "/events"), true)
    assert.equal(isRouteActive("/events/abc/checkin", "/events"), true)
    assert.equal(isRouteActive("/events-old", "/events"), false)
    assert.equal(isRouteActive("/email", "/events"), false)
})

test("initialsOf gives up to two uppercase letters", () => {
    assert.equal(initialsOf("Aadivya Raushan"), "AR")
    assert.equal(initialsOf("cher"), "C")
    assert.equal(initialsOf("  "), "?")
    assert.equal(initialsOf(undefined), "?")
})
