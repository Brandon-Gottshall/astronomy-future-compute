import { expect, test } from "@playwright/test";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_PUSHER_KEY",
  "NEXT_PUBLIC_PUSHER_CLUSTER",
  "PUSHER_APP_ID",
  "PUSHER_KEY",
  "PUSHER_SECRET",
  "PRESENTATION_TOKEN_SECRET",
];

const hasPresentationEnv = REQUIRED_ENV.every((name) => Boolean(process.env[name]));

test.describe("presentation mode regression", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(!hasPresentationEnv, "Presentation regression requires Pusher and token env vars.");

  test("stage, remote, and follow stay in sync across pairing and navigation", async ({ browser, baseURL }) => {
    const stage = await browser.newPage();
    await stage.goto(`${baseURL}/present`);
    await expect(stage.getByTestId("stage-setup")).toBeVisible();

    const pin = await stage.getByTestId("session-pin-value").textContent();
    expect(pin).toBeTruthy();

    const remoteUrl = await stage.getByTestId("speaker-url-brandon").textContent();
    expect(remoteUrl).toContain("/remote?");

    await stage.getByTestId("reveal-pair-token-brandon").click();
    await expect(stage.getByTestId("pair-token-brandon")).toBeVisible();
    const pairToken = await stage.getByTestId("pair-token-value-brandon").textContent();
    expect(pairToken).toBeTruthy();

    const followHref = await stage.locator('a[title="Scan to follow along"]').getAttribute("href");
    expect(followHref).toContain("/follow?");

    const remote = await browser.newPage();
    await remote.goto(remoteUrl);
    await expect(remote.getByTestId("remote-pairing")).toBeVisible();

    await remote.getByTestId("pair-token-input").fill(pairToken);
    await remote.getByTestId("session-pin-input").fill("1111");
    await remote.getByTestId("pair-remote-button").click();
    await expect(remote.getByText("That PIN is incorrect.")).toBeVisible();

    await remote.getByTestId("session-pin-input").fill(pin);
    await remote.getByTestId("pair-remote-button").click();
    await expect(remote.getByTestId("remote-setup")).toBeVisible();

    const follow = await browser.newPage();
    await follow.goto(followHref);
    await expect(follow.getByTestId("follow-waiting")).toBeVisible();

    await remote.getByTestId("begin-presentation").click();

    await expect(stage.getByTestId("stage-live")).toBeVisible();
    await expect(remote.getByTestId("remote-live")).toBeVisible();
    await expect(follow.getByTestId("follow-live")).toBeVisible();
    await expect(stage.getByTestId("stage-counter")).toHaveText("1 / 20");
    await expect(remote.getByTestId("remote-counter")).toHaveText("Slide 1 / 20");
    await expect(follow.getByTestId("follow-counter")).toHaveText("Slide 1 / 20");
    await expect(follow.getByText("Your notes")).toHaveCount(0);

    await stage.keyboard.press("ArrowRight");
    await expect(stage.getByTestId("stage-counter")).toHaveText("2 / 20");
    await expect(remote.getByTestId("remote-counter")).toHaveText("Slide 2 / 20");
    await expect(follow.getByTestId("follow-counter")).toHaveText("Slide 2 / 20");

    await remote.getByTestId("remote-next").click();
    await expect(stage.getByTestId("stage-counter")).toHaveText("3 / 20");
    await expect(follow.getByTestId("follow-counter")).toHaveText("Slide 3 / 20");

    await follow.getByTestId("follow-next").click();
    await expect(follow.getByTestId("follow-resume-sync")).toBeVisible();
    await follow.getByTestId("follow-resume-sync").click();
    await expect(follow.getByTestId("follow-resume-sync")).toHaveCount(0);
    await expect(follow.getByTestId("follow-counter")).toHaveText("Slide 3 / 20");

    await stage.keyboard.press("KeyR");
    await expect(stage.getByText("Re-pair a remote")).toBeVisible();
    await stage.keyboard.press("Escape");
    await expect(stage.getByTestId("stage-live")).toBeVisible();
  });

  test("pairing shows expired and invalid pair-token errors", async ({ browser, baseURL }) => {
    const stage = await browser.newPage();
    await stage.goto(`${baseURL}/present`);
    await expect(stage.getByTestId("stage-setup")).toBeVisible();

    const pin = await stage.getByTestId("session-pin-value").textContent();
    expect(pin).toBeTruthy();

    const remoteUrl = await stage.getByTestId("speaker-url-tre").textContent();
    await stage.getByTestId("reveal-pair-token-tre").click();
    await expect(stage.getByTestId("pair-token-tre")).toBeVisible();
    const pairToken = await stage.getByTestId("pair-token-value-tre").textContent();
    expect(pairToken).toBeTruthy();

    const remote = await browser.newPage();
    await remote.goto(remoteUrl);
    await expect(remote.getByTestId("remote-pairing")).toBeVisible();

    const expiredToken = `000000-${pairToken.split("-")[1]}-${pairToken.split("-")[2]}`;
    await remote.getByTestId("pair-token-input").fill(expiredToken);
    await remote.getByTestId("session-pin-input").fill(pin);
    await remote.getByTestId("pair-remote-button").click();
    await expect(
      remote.getByText("That pair token expired. Reveal a new token on the stage and try again.")
    ).toBeVisible();

    const invalidToken = `${pairToken.slice(0, 7)}AAAAAA${pairToken.slice(13)}`;
    await remote.getByTestId("pair-token-input").fill(invalidToken);
    await remote.getByTestId("pair-remote-button").click();
    await expect(
      remote.getByText("That pair token is invalid for this speaker link.")
    ).toBeVisible();
  });
});
