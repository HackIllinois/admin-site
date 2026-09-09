import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { test } from "node:test"
import {
    EMAIL_IMAGES,
    emailImageHtml,
    emailImageUrl,
} from "../util/email-images"
import { renderEmailBody } from "../util/email-template"

test("every selectable image exists in the deployed public directory", () => {
    for (const image of EMAIL_IMAGES) {
        assert.ok(
            existsSync(new URL(`../public${image.path}`, import.meta.url)),
            image.path,
        )
    }
})

test("image URLs use the configured public origin rather than the email page path", () => {
    assert.equal(
        emailImageUrl(
            EMAIL_IMAGES[0].path,
            "https://admin.hackillinois.org/email",
        ),
        "https://admin.hackillinois.org/email/speedrun_alpha_graphic.png",
    )
    assert.equal(
        emailImageUrl(EMAIL_IMAGES[0].path, "https://assets.example.com/"),
        "https://assets.example.com/email/speedrun_alpha_graphic.png",
    )
})

test("local preview origins are supported and unsafe URL schemes are rejected", () => {
    assert.equal(
        emailImageUrl(EMAIL_IMAGES[0].path, "http://localhost:3100"),
        "http://localhost:3100/email/speedrun_alpha_graphic.png",
    )
    assert.throws(() =>
        emailImageUrl(EMAIL_IMAGES[0].path, "javascript:alert(1)"),
    )
    assert.throws(() => emailImageHtml("data:text/html,hello", ""))
})

test("inserted HTML escapes attributes and retains the image in the outgoing email", () => {
    const url = emailImageUrl(
        EMAIL_IMAGES[0].path,
        "https://admin.hackillinois.org",
    )
    const html = emailImageHtml(url, '\" onerror=\"alert(1) <b>&')
    assert.ok(
        html.includes('alt="&quot; onerror=&quot;alert(1) &lt;b&gt;&amp;"'),
    )
    assert.ok(html.includes(`src="${url}"`))
    assert.ok(html.includes("max-width:560px"))
    assert.ok(
        renderEmailBody(html, "https://admin.hackillinois.org").includes(html),
    )
})
