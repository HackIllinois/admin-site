import assert from "node:assert/strict"
import { test } from "node:test"
import { resumeMessage } from "../util/resume-status"

test("resumeMessage explains 403 and 404", () => {
    assert.equal(resumeMessage(403), "You don't have access to this resume")
    assert.equal(resumeMessage(404), "No resume uploaded")
})

test("resumeMessage gives a generic note for other failures", () => {
    assert.equal(resumeMessage(500), "Could not load the resume")
    assert.equal(resumeMessage(undefined), "Could not load the resume")
})
