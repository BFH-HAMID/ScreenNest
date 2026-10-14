import { NextRequest, NextResponse } from "next/server";
import {
  demo,
  demoCatalog,
  matchesGenre,
  Title,
  MediaType,
} from "@/lib/catalog";
// Only fixed TMDB paths are allowed; this route is not an arbitrary URL proxy.
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const mode = p.get("mode") || "trending",
    type = p.get("type") || "",
    query = (p.get("q") || "").trim().slice(0, 120);
  const id = Number(p.get("id")),
    season = Number(p.get("season") || 1),
    page = Number(p.get("page") || 1),
    genre = Number(p.get("genre") || 0);
  if (
    ![
      "trending",
      "popular",
      "top_rated",
      "search",
      "discover",
      "detail",
      "season",
    ].includes(mode) ||
    !["", "movie", "tv"].includes(type) ||
    !Number.isInteger(page) ||
    page < 1 ||
    page > 500 ||
    !Number.isInteger(genre) ||
    genre < 0 ||
    (["detail", "season"].includes(mode) &&
      (!Number.isSafeInteger(id) || id < 1 || !type)) ||
    (mode === "season" &&
      (type !== "tv" ||
        !Number.isInteger(season) ||
        season < 1 ||
        season > 10000))
  )
    return NextResponse.json(
      { error: "Invalid catalog request" },
      { status: 400 },
    );
  const fallback = () => {
    if (mode === "detail") {
      const title = demo.find((t) => t.id === id && t.type === type);
      return title
        ? NextResponse.json({ title, source: "demo" })
        : NextResponse.json(
            { error: "Title unavailable in demo catalog" },
            { status: 404 },
          );
    }
    if (mode === "season")
      return NextResponse.json({ episodes: [], source: "demo" });
    return NextResponse.json({
      results: page === 1 ? demoCatalog(mode, type, query, genre) : [],
      page,
      totalPages: 1,
      source: "demo",
    });
  };
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) return fallback();
  const params = new URLSearchParams({
    language: "en-US",
    page: String(page),
    include_adult: "false",
  });
  let path = "";
  if (mode === "detail") {
    path = `/${type}/${id}`;
    params.set("append_to_response", "videos");
  } else if (mode === "season") path = `/tv/${id}/season/${season}`;
  else if (query) {
    path = `/search/${type || "multi"}`;
    params.set("query", query);
  } else if (genre) {
    path = `/discover/${type || "movie"}`;
    params.set(
      "with_genres",
      String(
        type === "tv"
          ? genre === 28
            ? 10759
            : genre === 878
              ? 10765
              : genre
          : genre,
      ),
    );
    params.set(
      "sort_by",
      mode === "top_rated" ? "vote_average.desc" : "popularity.desc",
    );
    params.set("vote_count.gte", "100");
  } else if (mode === "trending") path = `/trending/${type || "all"}/week`;
  else
    path = `/${type || "movie"}/${mode === "top_rated" ? "top_rated" : "popular"}`;
  try {
    const r = await fetch(`https://api.themoviedb.org/3${path}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(9000),
    });
    if (!r.ok) throw new Error(`TMDB ${r.status}`);
    const data = await r.json();
    if (mode === "season")
      return NextResponse.json({
        episodes: data.episodes.map((e: Record<string, unknown>) => ({
          id: e.id,
          episode_number: e.episode_number,
          name: e.name,
        })),
        source: "tmdb",
      });
    if (mode === "detail")
      return NextResponse.json({
        title: normalize(data, type as MediaType),
        source: "tmdb",
      });
    return NextResponse.json({
      results: data.results
        .filter((t: Raw) => !t.adult && t.media_type !== "person")
        .map((t: Raw) =>
          normalize(t, (t.media_type || type || "movie") as MediaType),
        )
        .filter((t: Title) => !query || matchesGenre(t, genre)),
      page: data.page,
      totalPages: Math.min(data.total_pages, 500),
      source: "tmdb",
    });
  } catch {
    return NextResponse.json(
      {
        error: "The live catalog is temporarily unavailable. Please try again.",
      },
      { status: 502 },
    );
  }
}
type Raw = {
  id: number;
  media_type?: string;
  adult?: boolean;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  genre_ids?: number[];
  genres?: { id: number }[];
  runtime?: number;
  seasons?: Title["seasons"];
  videos?: { results: { site: string; type: string; key: string }[] };
};
function normalize(t: Raw, type: MediaType): Title {
  return {
    id: t.id,
    type,
    title: t.title || t.name || "Untitled",
    year: (t.release_date || t.first_air_date || "").slice(0, 4),
    rating: t.vote_average || 0,
    poster: t.poster_path || "",
    backdrop: t.backdrop_path || "",
    overview: t.overview || "No synopsis available yet.",
    genres: t.genre_ids || t.genres?.map((g) => g.id) || [],
    runtime: t.runtime,
    seasons: t.seasons?.filter((s) => s.season_number > 0),
    trailer: t.videos?.results.find(
      (v) => v.site === "YouTube" && v.type === "Trailer",
    )?.key,
  };
}
