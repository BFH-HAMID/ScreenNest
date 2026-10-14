import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Provider availability is external. Assert integration without launching media in CI.
  await page.route("https://nxsha.screenscape.me/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<p>Provider test stub</p>",
    }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Details for Dune: Part Two" }),
  ).toBeVisible();
});
test("search, navigation, persistent watchlist and dialog keyboard access", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Save Dune: Part Two", exact: true })
    .click();
  await page.reload();
  await page
    .getByRole("navigation", { name: "Your library" })
    .getByRole("button", { name: /Watchlist/ })
    .click();
  await expect(
    page.getByRole("button", { name: "Details for Dune: Part Two" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Details for Dune: Part Two" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "Movies", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search movies and TV shows" })
    .fill("Interstellar");
  await expect(
    page.getByRole("button", { name: "Details for Interstellar" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Details for Dune: Part Two" }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Search movies and TV shows" })
    .fill("zzzzzzz");
  await expect(page.getByText("No stories found. Yet.")).toBeVisible();
});
test("movie and episode launch URLs, click-to-load and launch history", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Watch now", exact: true }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Launch player" }).click();
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    /tmdb=693134&type=movie&lan=eng/,
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "TV Shows", exact: true })
    .click();
  await page.getByRole("button", { name: "Details for Breaking Bad" }).click();
  await page.getByRole("spinbutton", { name: "Season number" }).fill("2");
  await page.getByRole("spinbutton", { name: "Episode number" }).fill("3");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Watch now", exact: true })
    .click();
  await page.getByRole("button", { name: "Launch player" }).click();
  await expect(page.locator("iframe")).toHaveAttribute(
    "src",
    /tmdb=1396&type=tv&lan=eng&s=2&e=3/,
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Recently watched", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Details for Breaking Bad" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Details for Dune: Part Two" }),
  ).toBeVisible();
});
test("mobile layout has no horizontal overflow and navigation works", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "TV Shows", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Explore tv shows." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Details for Breaking Bad" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
