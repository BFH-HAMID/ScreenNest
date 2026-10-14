import { test } from "node:test";
import assert from "node:assert/strict";
import { demo, demoCatalog, embedUrl } from "../src/lib/catalog";
import { GET } from "../src/app/api/catalog/route";
import { NextRequest } from "next/server";

test("movie embed follows the published Screenscape API", () => {
  const url = new URL(embedUrl(demo[0]));
  assert.equal(url.origin, "https://nxsha.screenscape.me");
  assert.equal(url.pathname, "/embed");
  assert.equal(url.searchParams.get("tmdb"), "693134");
  assert.equal(url.searchParams.get("type"), "movie");
  assert.equal(url.searchParams.has("s"), false);
});
test("TV embed includes season, episode and language", () => {
  const url = new URL(embedUrl({ id: 1396, type: "tv" }, 2, 3, "hindi"));
  assert.equal(url.searchParams.get("s"), "2");
  assert.equal(url.searchParams.get("e"), "3");
  assert.equal(url.searchParams.get("lan"), "hindi");
});
test("embed validation prevents invalid IDs, episodes and languages", () => {
  assert.throws(() => embedUrl({ id: -1, type: "movie" }));
  assert.throws(() => embedUrl({ id: 1396, type: "tv" }, 0, 1));
  assert.throws(() => embedUrl({ id: 1396, type: "tv" }, 1, 1.5));
  assert.equal(
    new URL(embedUrl(demo[0], 1, 1, "bad&tmdb=9")).searchParams.get("lan"),
    "eng",
  );
});
test("demo search, genres, type and rating sorting work", () => {
  assert.equal(demoCatalog("search", "", "INTERSTELLAR", 0)[0].id, 157336);
  assert.ok(demoCatalog("popular", "tv", "", 0).every((t) => t.type === "tv"));
  assert.ok(
    demoCatalog("popular", "", "", 16).every((t) => t.genres.includes(16)),
  );
  assert.equal(
    demoCatalog("search", "", "a title that does not exist", 0).length,
    0,
  );
  const sorted = demoCatalog("top_rated", "", "", 0);
  assert.ok(
    sorted.every((t, i) => i === 0 || sorted[i - 1].rating >= t.rating),
  );
});
const request = (query: string) =>
  new NextRequest(`http://localhost/api/catalog?${query}`);
test("route validates input, serves demo without credentials, and caps pagination", async () => {
  const prior = process.env.TMDB_READ_ACCESS_TOKEN;
  delete process.env.TMDB_READ_ACCESS_TOKEN;
  try {
    for (const q of [
      "mode=bad",
      "page=0",
      "page=501",
      "type=person",
      "mode=detail&type=movie&id=NaN",
      "mode=season&type=tv&id=1396&season=-1",
      "genre=oops",
    ])
      assert.equal((await GET(request(q))).status, 400, q);
    const result = await (await GET(request("type=movie"))).json();
    assert.equal(result.source, "demo");
    assert.ok(result.results.length > 0);
    assert.deepEqual((await (await GET(request("page=2"))).json()).results, []);
    assert.equal(
      (await GET(request("mode=detail&type=movie&id=9999999"))).status,
      404,
    );
    assert.equal(
      (await (await GET(request("mode=detail&type=movie&id=693134"))).json())
        .title.title,
      "Dune: Part Two",
    );
  } finally {
    if (prior) process.env.TMDB_READ_ACCESS_TOKEN = prior;
  }
});
test("live API keeps token server-side, normalizes records and filters people/adult entries", async () => {
  const oldFetch = globalThis.fetch,
    oldToken = process.env.TMDB_READ_ACCESS_TOKEN;
  process.env.TMDB_READ_ACCESS_TOKEN = "test-secret";
  let called = "";
  globalThis.fetch = async (input, init) => {
    called = String(input);
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      "Bearer test-secret",
    );
    return Response.json({
      results: [
        {
          id: 1,
          name: "A series",
          first_air_date: "2024-01-01",
          media_type: "tv",
          vote_average: 8,
          genre_ids: [18],
        },
        { id: 2, media_type: "person" },
        { id: 3, media_type: "movie", adult: true },
      ],
      page: 1,
      total_pages: 900,
    });
  };
  try {
    const response = await GET(request("mode=search&q=hello"));
    const body = await response.json();
    assert.ok(called.startsWith("https://api.themoviedb.org/3/search/multi"));
    assert.equal(body.results.length, 1);
    assert.equal(body.results[0].title, "A series");
    assert.equal(body.results[0].type, "tv");
    assert.equal(body.totalPages, 500);
    assert.ok(!JSON.stringify(body).includes("test-secret"));
  } finally {
    globalThis.fetch = oldFetch;
    if (oldToken) process.env.TMDB_READ_ACCESS_TOKEN = oldToken;
    else delete process.env.TMDB_READ_ACCESS_TOKEN;
  }
});
test("live API outage is explicit, not silently replaced with fake live data", async () => {
  const oldFetch = globalThis.fetch,
    oldToken = process.env.TMDB_READ_ACCESS_TOKEN;
  process.env.TMDB_READ_ACCESS_TOKEN = "test";
  globalThis.fetch = async () => new Response("", { status: 401 });
  try {
    const r = await GET(request(""));
    assert.equal(r.status, 502);
    assert.ok((await r.json()).error);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldToken) process.env.TMDB_READ_ACCESS_TOKEN = oldToken;
    else delete process.env.TMDB_READ_ACCESS_TOKEN;
  }
});
