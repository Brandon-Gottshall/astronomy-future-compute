import { expect, test } from "@playwright/test";
import { PRESENTATION_STORAGE_KEY } from "../../lib/session.js";

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

  async function revealRemoteSessionId(page, speakerId = "brandon") {
    await page.getByTestId(`reveal-pair-token-${speakerId}`).click();
    await expect(page.getByTestId(`pair-token-${speakerId}`)).toBeVisible();
    const remoteUrl = await page.getByTestId(`speaker-url-${speakerId}`).textContent();
    expect(remoteUrl).toContain("/remote?");
    expect(remoteUrl).toContain("pt=");
    return new URL(remoteUrl).searchParams.get("s");
  }

  test("stage session and PIN persist until explicitly reset", async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    const stage = await context.newPage();
    await stage.goto(`${baseURL}/present`);
    await expect(stage.getByTestId("stage-setup")).toBeVisible();

    const initialPin = await stage.getByTestId("session-pin-value").textContent();
    expect(initialPin).toMatch(/^\d{4}$/);
    const initialSessionId = await revealRemoteSessionId(stage);
    expect(initialSessionId).toBeTruthy();

    await stage.reload();
    await expect(stage.getByTestId("stage-setup")).toBeVisible();
    await expect(stage.getByTestId("session-pin-value")).toHaveText(initialPin);
    expect(await revealRemoteSessionId(stage)).toBe(initialSessionId);

    const secondStage = await context.newPage();
    await secondStage.goto(`${baseURL}/present`);
    await expect(secondStage.getByTestId("stage-setup")).toBeVisible();
    await expect(secondStage.getByTestId("session-pin-value")).toHaveText(initialPin);
    expect(await revealRemoteSessionId(secondStage)).toBe(initialSessionId);

    secondStage.on("dialog", (dialog) => dialog.accept());
    await secondStage.getByTestId("reset-presentation-session").click();
    await expect
      .poll(() =>
        secondStage.evaluate((key) => {
          const saved = window.localStorage.getItem(key);
          return saved ? JSON.parse(saved).sessionId : null;
        }, PRESENTATION_STORAGE_KEY)
      )
      .not.toBe(initialSessionId);
    await expect(secondStage.getByTestId("session-pin-value")).toHaveText(/^\d{4}$/);
    const resetPin = await secondStage.getByTestId("session-pin-value").textContent();
    const resetSessionId = await revealRemoteSessionId(secondStage);
    expect(resetSessionId).not.toBe(initialSessionId);
    await expect(stage.getByTestId("session-pin-value")).toHaveText(resetPin);
    expect(await revealRemoteSessionId(stage)).toBe(resetSessionId);

    const thirdStage = await context.newPage();
    await thirdStage.goto(`${baseURL}/present`);
    await expect(thirdStage.getByTestId("stage-setup")).toBeVisible();
    await expect(thirdStage.getByTestId("session-pin-value")).toHaveText(resetPin);
    expect(await revealRemoteSessionId(thirdStage)).toBe(resetSessionId);

    await context.close();
  });

  test("stage, remote, and follow stay in sync across pairing and navigation", async ({ browser, baseURL }) => {
    const stage = await browser.newPage();
    await stage.goto(`${baseURL}/present`);
    await expect(stage.getByTestId("stage-setup")).toBeVisible();

    const pin = await stage.getByTestId("session-pin-value").textContent();
    expect(pin).toBeTruthy();

    await stage.getByTestId("reveal-pair-token-brandon").click();
    await expect(stage.getByTestId("pair-token-brandon")).toBeVisible();
    const remoteUrl = await stage.getByTestId("speaker-url-brandon").textContent();
    expect(remoteUrl).toContain("/remote?");
    expect(remoteUrl).toContain("pt=");

    const followHref = await stage.locator('a[title="Scan to follow along"]').getAttribute("href");
    expect(followHref).toContain("/follow?");

    const remote = await browser.newPage();
    await remote.goto(remoteUrl);
    await expect(remote.getByTestId("remote-pairing")).toBeVisible();
    await expect(remote.getByText("QR token detected. Enter the stage PIN to continue.")).toBeVisible();

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
    await expect(stage.getByTestId("stage-counter")).toHaveText("1 / 11");
    await expect(remote.getByTestId("remote-counter")).toHaveText("Slide 1 / 11");
    await expect(follow.getByTestId("follow-counter")).toHaveText("Slide 1 / 11");
    await expect(follow.getByText("Your notes")).toHaveCount(0);

    await stage.keyboard.press("ArrowRight");
    await expect(stage.getByTestId("stage-counter")).toHaveText("2 / 11");
    await expect(remote.getByTestId("remote-counter")).toHaveText("Slide 2 / 11");
    await expect(follow.getByTestId("follow-counter")).toHaveText("Slide 2 / 11");

    await remote.getByTestId("remote-next").click();
    await expect(stage.getByTestId("stage-counter")).toHaveText("3 / 11");
    await expect(follow.getByTestId("follow-counter")).toHaveText("Slide 3 / 11");

    await follow.getByTestId("follow-next").click();
    await expect(follow.getByTestId("follow-resume-sync")).toBeVisible();
    await follow.getByTestId("follow-resume-sync").click();
    await expect(follow.getByTestId("follow-resume-sync")).toHaveCount(0);
    await expect(follow.getByTestId("follow-counter")).toHaveText("Slide 3 / 11");

    await stage.keyboard.press("KeyR");
    await expect(stage.getByText("Re-pair a remote")).toBeVisible();
    await expect(stage.getByTestId("session-pin-value")).toHaveText(pin);
    await stage.keyboard.press("Escape");
    await expect(stage.getByTestId("stage-live")).toBeVisible();
  });

  test("pairing shows expired and invalid pair-token errors", async ({ browser, baseURL }) => {
    const stage = await browser.newPage();
    await stage.goto(`${baseURL}/present`);
    await expect(stage.getByTestId("stage-setup")).toBeVisible();

    const pin = await stage.getByTestId("session-pin-value").textContent();
    expect(pin).toBeTruthy();

    await stage.getByTestId("reveal-pair-token-tre").click();
    await expect(stage.getByTestId("pair-token-tre")).toBeVisible();
    const remoteUrl = await stage.getByTestId("speaker-url-tre").textContent();
    expect(remoteUrl).toContain("pt=");
    const remoteUrlObject = new URL(remoteUrl);
    const pairToken = remoteUrlObject.searchParams.get("pt");
    expect(pairToken).toBeTruthy();

    const remote = await browser.newPage();
    const expiredUrl = new URL(remoteUrl);
    expiredUrl.searchParams.set(
      "pt",
      `000000-${pairToken.split("-")[1]}-${pairToken.split("-")[2]}`
    );
    await remote.goto(expiredUrl.toString());
    await expect(remote.getByTestId("remote-pairing")).toBeVisible();

    await remote.getByTestId("session-pin-input").fill(pin);
    await remote.getByTestId("pair-remote-button").click();
    await expect(
      remote.getByText("That QR expired. Ask the stage to refresh it, then scan again.")
    ).toBeVisible();

    const invalidUrl = new URL(remoteUrl);
    invalidUrl.searchParams.set(
      "pt",
      `${pairToken.slice(0, 7)}AAAAAA${pairToken.slice(13)}`
    );
    await remote.goto(invalidUrl.toString());
    await expect(remote.getByTestId("remote-pairing")).toBeVisible();
    await remote.getByTestId("session-pin-input").fill(pin);
    await remote.getByTestId("pair-remote-button").click();
    await expect(
      remote.getByText("This QR is no longer valid for this speaker. Ask the stage to refresh it.")
    ).toBeVisible();
  });
});
