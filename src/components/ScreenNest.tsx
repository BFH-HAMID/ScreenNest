"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  Home,
  Clapperboard,
  Tv,
  Bookmark,
  History,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Play,
  Plus,
  Check,
  X,
  Star,
  Info,
  Settings,
  HelpCircle,
  Menu,
  ArrowUpRight,
  Sparkles,
  Film,
  LoaderCircle,
  Trash2,
  SlidersHorizontal,
  ExternalLink,
  Volume2,
} from "lucide-react";
import {
  demo,
  genres,
  imageUrl,
  embedUrl,
  localPosters,
  matchesGenre,
  type Title,
} from "@/lib/catalog";

type View =
  | "Home"
  | "Movies"
  | "TV Shows"
  | "Animation"
  | "Watchlist"
  | "Recently watched";
type HistoryEntry = {
  title: Title;
  season: number;
  episode: number;
  watchedAt: number;
};
type Catalog = {
  results: Title[];
  source: "demo" | "tmdb";
  totalPages: number;
};
const keyOf = (t: Title) => `${t.type}-${t.id}`;
const navItems = [
  { name: "Home", icon: Home },
  { name: "Movies", icon: Clapperboard },
  { name: "TV Shows", icon: Tv },
  { name: "Animation", icon: Sparkles },
] as const;

function Poster({ title }: { title: Title }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="poster-art">
      {!failed && title.poster ? (
        <img
          src={
            localPosters[`${title.type}-${title.id}`] || imageUrl(title.poster)
          }
          alt={title.title}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="poster-fallback">
          <Film size={34} />
          <span>{title.title}</span>
        </div>
      )}
    </div>
  );
}
function Modal({
  children,
  onClose,
  label,
  wide = false,
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    function keys(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const els = Array.from(
          ref.current?.querySelectorAll<HTMLElement>(
            'button, a[href], input, select, iframe, [tabindex="0"]',
          ) || [],
        ).filter((el) => !el.hasAttribute("disabled"));
        const first = els[0],
          last = els[els.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", keys);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", keys);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-shade"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`modal ${wide ? "wide" : ""}`}
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button
          className="icon-button close-modal"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function ScreenNest() {
  const [view, setView] = useState<View>("Home");
  const [sidebar, setSidebar] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [genre, setGenre] = useState(0);
  const [sort, setSort] = useState("trending");
  const [page, setPage] = useState(1);
  const [catalog, setCatalog] = useState<Catalog>({
    results: demo,
    source: "demo",
    totalPages: 1,
  });
  const [series, setSeries] = useState<Title[]>(
    demo.filter((t) => t.type === "tv"),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [saved, setSaved] = useState<Title[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Title | null>(null);
  const [wantsPlay, setWantsPlay] = useState(false);
  const [panel, setPanel] = useState<"settings" | "help" | null>(null);
  const [language, setLanguage] = useState("eng");
  const [toast, setToast] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [allTrending, setAllTrending] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const featured = [demo[0], demo[2], demo[3]];
  const hero = featured[heroIndex];
  const library = view === "Watchlist" || view === "Recently watched";
  const closeSelected = useCallback(() => setSelected(null), []);
  const closePanel = useCallback(() => setPanel(null), []);
  useEffect(() => {
    try {
      const s = JSON.parse(
        localStorage.getItem("screennest-watchlist") || "[]",
      );
      const h = JSON.parse(localStorage.getItem("screennest-history") || "[]");
      const valid = (t: Title) =>
        t &&
        Number.isInteger(t.id) &&
        ["movie", "tv"].includes(t.type) &&
        typeof t.title === "string" &&
        Array.isArray(t.genres);
      if (Array.isArray(s)) setSaved(s.filter(valid));
      if (Array.isArray(h))
        setHistory(
          h.filter((e) => e && valid(e.title) && Number.isFinite(e.watchedAt)),
        );
      const l = localStorage.getItem("screennest-language");
      if (l && ["eng", "hindi", "ben"].includes(l)) setLanguage(l);
    } catch {
      /* Corrupt or unavailable storage must not prevent browsing. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("screennest-watchlist", JSON.stringify(saved));
      localStorage.setItem("screennest-history", JSON.stringify(history));
      localStorage.setItem("screennest-language", language);
    } catch {
      setToast(
        "Browser storage is unavailable. Changes will last for this visit only.",
      );
    }
  }, [saved, history, language, ready]);
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(query.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3800);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    function keyboard(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        ) &&
        !selected &&
        !panel
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", keyboard);
    return () => document.removeEventListener("keydown", keyboard);
  }, [selected, panel]);
  useEffect(() => {
    if (library) {
      setLoading(false);
      setError("");
      return;
    }
    const controller = new AbortController();
    const type =
      view === "TV Shows"
        ? "tv"
        : view === "Movies" || view === "Animation"
          ? "movie"
          : "";
    const params = new URLSearchParams({
      mode: debounced ? "search" : sort,
      type,
      q: debounced,
      genre: String(view === "Animation" ? 16 : genre),
      page: String(page),
    });
    setLoading(true);
    setError("");
    fetch(`/api/catalog?${params}`, { signal: controller.signal })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error || "Unable to load titles");
        return d;
      })
      .then((d: Catalog) => setCatalog(d))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [view, genre, debounced, sort, page, library, reload]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalog?type=tv&mode=popular", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.results) setSeries(d.results);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  function navigate(v: View) {
    setView(v);
    setGenre(0);
    setQuery("");
    setDebounced("");
    setPage(1);
    setSort("trending");
    setAllTrending(false);
    setSidebar(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function toggleSaved(t: Title) {
    const exists = saved.some((s) => keyOf(s) === keyOf(t));
    setSaved((s) =>
      exists ? s.filter((x) => keyOf(x) !== keyOf(t)) : [t, ...s],
    );
    setToast(
      exists ? "Removed from your watchlist" : "Added to your watchlist",
    );
  }
  function openTitle(t: Title, play = false) {
    setWantsPlay(play);
    setSelected(t);
  }
  function record(t: Title, season: number, episode: number) {
    setHistory((h) =>
      [
        { title: t, season, episode, watchedAt: Date.now() },
        ...h.filter((x) => keyOf(x.title) !== keyOf(t)),
      ].slice(0, 100),
    );
  }
  const libraryTitles =
    view === "Watchlist" ? saved : history.map((h) => h.title);
  const visible = library
    ? libraryTitles.filter(
        (t) =>
          (!debounced ||
            t.title.toLowerCase().includes(debounced.toLowerCase())) &&
          matchesGenre(t, genre),
      )
    : catalog.results;
  if (library && sort === "top_rated")
    visible.sort((a, b) => b.rating - a.rating);
  const showHome = view === "Home" && !debounced;
  const title = debounced
    ? `Results for “${debounced}”`
    : view === "Home"
      ? genre
        ? `${genres.find((g) => g.id === genre)?.name} worth watching`
        : "Trending now"
      : view === "Animation"
        ? "Animated worlds"
        : view;
  function cards(titles: Title[]) {
    return titles.map((t) => (
      <article className="movie-card" key={keyOf(t)}>
        <button
          className="poster-button"
          onClick={() => openTitle(t)}
          aria-label={`Details for ${t.title}`}
        >
          <Poster title={t} />
          <span className="rating">
            <Star size={11} fill="currentColor" />
            {t.rating.toFixed(1)}
          </span>
          <span className="poster-play">
            <Play size={22} fill="currentColor" />
          </span>
          {t.type === "tv" && <span className="series-tag">SERIES</span>}
        </button>
        <button
          className={`save-small ${saved.some((s) => keyOf(s) === keyOf(t)) ? "is-saved" : ""}`}
          onClick={() => toggleSaved(t)}
          aria-label={`${saved.some((s) => keyOf(s) === keyOf(t)) ? "Remove" : "Save"} ${t.title}`}
        >
          <>
            {saved.some((s) => keyOf(s) === keyOf(t)) ? (
              <Check size={15} />
            ) : (
              <Plus size={15} />
            )}
          </>
        </button>
        <button className="card-title" onClick={() => openTitle(t)}>
          {t.title}
        </button>
        <div className="card-meta">
          <span>{t.year || "Upcoming"}</span>
          <i />
          <span>
            {t.type === "tv"
              ? "TV Series"
              : genres.find((g) => t.genres.includes(g.id))?.name || "Movie"}
          </span>
        </div>
      </article>
    ));
  }
  return (
    <div className="app-shell">
      {sidebar && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setSidebar(false)}
        />
      )}
      <aside className={`sidebar ${sidebar ? "open" : ""}`}>
        <button
          className="brand"
          onClick={() => navigate("Home")}
          aria-label="ScreenNest home"
        >
          <span className="brand-mark">
            <Play size={20} fill="currentColor" />
          </span>
          <span>
            Screen<span className="brand-accent">Nest</span>
            <sup>®</sup>
          </span>
        </button>
        <div className="nav-group-label">DISCOVER</div>
        <nav aria-label="Main navigation">
          {navItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${view === name ? "active" : ""}`}
              onClick={() => navigate(name)}
              aria-current={view === name ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "Animation" && <span className="tiny-label">NEW</span>}
            </button>
          ))}
        </nav>
        <div className="nav-group-label library-label">YOUR LIBRARY</div>
        <nav aria-label="Your library">
          <button
            className={`nav-item ${view === "Watchlist" ? "active" : ""}`}
            onClick={() => navigate("Watchlist")}
          >
            <Bookmark size={19} />
            <span>Watchlist</span>
            {saved.length > 0 && (
              <span className="nav-count">{saved.length}</span>
            )}
          </button>
          <button
            className={`nav-item ${view === "Recently watched" ? "active" : ""}`}
            onClick={() => navigate("Recently watched")}
          >
            <History size={19} />
            <span>Recently watched</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="little-escape">
            <span className="escape-icon">
              <Sparkles size={19} />
            </span>
            <strong>
              Your next obsession
              <br />
              is one play away.
            </strong>
            <p>Make yourself at home.</p>
            <button
              onClick={() => {
                const pool = catalog.results.length ? catalog.results : demo;
                openTitle(pool[Math.floor(Math.random() * pool.length)]);
              }}
            >
              Find me something <ArrowUpRight size={15} />
            </button>
          </div>
          <button className="nav-item" onClick={() => setPanel("settings")}>
            <Settings size={18} />
            Settings
          </button>
          <button className="nav-item" onClick={() => setPanel("help")}>
            <HelpCircle size={18} />
            Help & information
          </button>
          <div className="sidebar-copyright">
            <span className="online-dot" /> A little escape. A lot to explore.
            <small>© {new Date().getFullYear()} ScreenNest</small>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setSidebar(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb">
              Discover <ChevronRight size={13} /> <b>{view}</b>
            </span>
          </div>
          <div className="topbar-right">
            <div className="search-box">
              <Search size={17} />
              <input
                ref={searchRef}
                aria-label="Search movies and TV shows"
                placeholder="Search movies, shows and more..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query ? (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <X size={15} />
                </button>
              ) : (
                <kbd>/</kbd>
              )}
            </div>
            <button
              className="profile"
              onClick={() => setPanel("settings")}
              aria-label="Open local profile settings"
            >
              <span>H</span>
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        {showHome && (
          <section
            className={`hero hero-${heroIndex}`}
            aria-label="Featured title"
            style={{
              backgroundImage: `url('${heroIndex === 0 ? "/images/dune-hero.jpg" : imageUrl(hero.backdrop, "original")}')`,
            }}
          >
            <div className="hero-shade" />
            <div className="hero-content">
              <div className="featured-label">
                <span /> THE SPOTLIGHT <span className="featured-divider" />{" "}
                CURATED FOR YOU
              </div>
              <div className="hero-eyebrow">
                {heroIndex === 0
                  ? "DESTINY IS WRITTEN IN THE SAND."
                  : heroIndex === 1
                    ? "GO BEYOND WHAT YOU KNOW."
                    : "EVERY WORLD HAS A HERO."}
              </div>
              {heroIndex === 0 ? (
                <h1 className="dune-title">
                  DUNE<span>PART TWO</span>
                </h1>
              ) : (
                <h1 className="hero-title">{hero.title}</h1>
              )}
              <div className="hero-metadata">
                <span className="hero-rating">
                  <Star size={14} fill="currentColor" /> {hero.rating}
                </span>
                <span>{hero.year}</span>
                <span>
                  {Math.floor((hero.runtime || 0) / 60)}h{" "}
                  {(hero.runtime || 0) % 60}m
                </span>
                <span className="outline-tag">PG-13</span>
                <span className="quality-tag">HD</span>
              </div>
              <p className="hero-description">{hero.overview}</p>
              <div className="hero-actions">
                <button
                  className="button primary"
                  onClick={() => openTitle(hero, true)}
                >
                  <Play size={17} fill="currentColor" />
                  Watch now
                </button>
                <button
                  className="button glass"
                  onClick={() => toggleSaved(hero)}
                >
                  {saved.some((t) => t.id === hero.id) ? (
                    <Check size={19} />
                  ) : (
                    <Plus size={19} />
                  )}
                  Watchlist
                </button>
                <button
                  className="hero-info"
                  aria-label="More information about featured title"
                  onClick={() => openTitle(hero)}
                >
                  <Info size={21} />
                </button>
              </div>
            </div>
            <div className="hero-bottom">
              <div className="hero-genres">
                {hero.genres
                  .map((id) => genres.find((g) => g.id === id)?.name)
                  .filter(Boolean)
                  .join("  ·  ")}
              </div>
              <div className="hero-pagination">
                <span>
                  0{heroIndex + 1}
                  <i> / 03</i>
                </span>
                {featured.map((t, i) => (
                  <button
                    key={t.id}
                    aria-label={`Feature ${t.title}`}
                    aria-pressed={i === heroIndex}
                    className={i === heroIndex ? "current" : ""}
                    onClick={() => setHeroIndex(i)}
                  />
                ))}
                <button
                  className="hero-arrow"
                  aria-label="Next featured movie"
                  onClick={() => setHeroIndex((i) => (i + 1) % 3)}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </section>
        )}
        <div className="content">
          {!showHome && (
            <div className="page-heading">
              <div className="overline">YOUR WORLD OF ENTERTAINMENT</div>
              <h1>
                {debounced
                  ? "Find your next story."
                  : view === "Watchlist"
                    ? "Good stories. Saved for later."
                    : view === "Recently watched"
                      ? "Pick up where you left off."
                      : view === "Animation"
                        ? "A little imagination. No limits."
                        : `Explore ${view.toLowerCase()}.`}
              </h1>
              <p>
                {library
                  ? "Your personal collection, saved on this device."
                  : view === "Animation"
                    ? "Discover animated films and imaginative adventures."
                    : "The stories you love. The ones you haven’t discovered yet."}
              </p>
            </div>
          )}
          <div className="genre-bar">
            <div className="genre-scroll">
              {genres.map((g) => (
                <button
                  key={g.id}
                  className={`genre-chip ${genre === g.id ? "selected" : ""}`}
                  onClick={() => {
                    setGenre(g.id);
                    setPage(1);
                  }}
                  disabled={view === "Animation" && g.id !== 0 && g.id !== 16}
                >
                  {g.id === 0 && <Sparkles size={14} />} {g.name}
                </button>
              ))}
            </div>
            <button
              className="filter-button"
              aria-label="Show top-rated titles"
              aria-pressed={sort === "top_rated"}
              title="Show top rated"
              onClick={() => {
                setSort((s) => (s === "top_rated" ? "trending" : "top_rated"));
                setPage(1);
              }}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
          <section className="catalog-section">
            <div className="section-heading">
              <div>
                <h2>
                  {title}
                  {view === "Home" && !debounced && !genre && (
                    <span className="orange-dot" />
                  )}
                </h2>
                <p>
                  {debounced
                    ? `${visible.length} titles on this page`
                    : library
                      ? `${visible.length} ${visible.length === 1 ? "title" : "titles"} in your collection`
                      : sort === "top_rated"
                        ? "Highly rated. Worth your time."
                        : genre
                          ? "Find your kind of story."
                          : "The stories everyone’s talking about."}
                </p>
              </div>
              <div className="section-tools">
                {!library && (
                  <label className="sort-select">
                    <span className="sr-only">Sort titles</span>
                    <select
                      value={sort}
                      onChange={(e) => {
                        setSort(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="trending">This week</option>
                      <option value="popular">Popular</option>
                      <option value="top_rated">Top rated</option>
                    </select>
                    <ChevronDown size={12} />
                  </label>
                )}
                {showHome && !allTrending && (
                  <button
                    className="text-link"
                    onClick={() => setAllTrending(true)}
                  >
                    View all <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
            {error ? (
              <div className="empty-state" role="alert">
                <Info />
                <h3>Taking a little intermission.</h3>
                <p>{error}</p>
                <button
                  className="button primary"
                  onClick={() => setReload((r) => r + 1)}
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div
                className="movie-grid"
                aria-label="Loading titles"
                aria-busy="true"
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <div className="skeleton-card" key={i}>
                    <div />
                    <span />
                    <small />
                  </div>
                ))}
              </div>
            ) : visible.length ? (
              <div className="movie-grid">
                {cards(
                  showHome && !allTrending ? visible.slice(0, 6) : visible,
                )}
              </div>
            ) : (
              <div className="empty-state">
                {view === "Watchlist" ? (
                  <Bookmark size={36} />
                ) : view === "Recently watched" ? (
                  <History size={36} />
                ) : (
                  <Search size={36} />
                )}
                <h3>
                  {library
                    ? "Your next chapter starts here."
                    : "No stories found. Yet."}
                </h3>
                <p>
                  {view === "Watchlist"
                    ? "Tap the + on any title to keep it here for later."
                    : view === "Recently watched"
                      ? "Titles appear here when you launch their player."
                      : "Try another title or select a different genre."}
                </p>
                <button
                  className="button primary"
                  onClick={() => navigate("Home")}
                >
                  Explore titles
                </button>
              </div>
            )}
            {!library &&
              catalog.totalPages > 1 &&
              (!showHome || allTrending) && (
                <div className="pagination">
                  <button
                    className="button subtle"
                    disabled={page === 1 || loading}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <span>
                    Page {page} of {catalog.totalPages}
                  </span>
                  <button
                    className="button subtle"
                    disabled={page === catalog.totalPages || loading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
          </section>
          {showHome && !genre && (
            <>
              <section className="catalog-section series-section">
                <div className="section-heading">
                  <div>
                    <div className="overline">JUST ONE MORE EPISODE</div>
                    <h2>Big stories. Small screen.</h2>
                    <p>Your next binge starts right here.</p>
                  </div>
                  <button
                    className="text-link"
                    onClick={() => navigate("TV Shows")}
                  >
                    Explore series <ChevronRight size={14} />
                  </button>
                </div>
                <div className="movie-grid">{cards(series.slice(0, 6))}</div>
              </section>
              <section className="discovery-banner">
                <div>
                  <span className="overline">
                    LESS SCROLLING. MORE WATCHING.
                  </span>
                  <h2>Not sure what to watch?</h2>
                  <p>Let a great story find you.</p>
                </div>
                <button
                  className="button primary"
                  onClick={() => {
                    const pool = catalog.results.length
                      ? catalog.results
                      : demo;
                    openTitle(pool[Math.floor(Math.random() * pool.length)]);
                  }}
                >
                  <Sparkles size={17} />
                  Surprise me
                </button>
                <Film className="banner-film" size={150} />
              </section>
            </>
          )}
          <footer className="footer">
            <div>
              <button className="footer-brand" onClick={() => navigate("Home")}>
                Screen<span>Nest</span>
              </button>
              <p>A world of stories. Your little escape.</p>
            </div>
            <div className="footer-details">
              <span className="catalog-status">
                <span className="online-dot" />
                {catalog.source === "demo"
                  ? "Curated demo catalog"
                  : "Live TMDB catalog"}
              </span>
              <p>Metadata by TMDB · Player by Screenscape</p>
              <button onClick={() => setPanel("help")}>
                About, privacy & content information <ArrowUpRight size={12} />
              </button>
            </div>
          </footer>
        </div>
      </main>
      {selected && (
        <Modal onClose={closeSelected} label={selected.title} wide>
          <TitleDetail
            key={keyOf(selected)}
            title={selected}
            initialPlay={wantsPlay}
            saved={saved.some((t) => keyOf(t) === keyOf(selected))}
            toggleSaved={() => toggleSaved(selected)}
            language={language}
            onLaunch={record}
            resume={history.find((h) => keyOf(h.title) === keyOf(selected))}
          />
        </Modal>
      )}
      {panel && (
        <Modal
          onClose={closePanel}
          label={panel === "settings" ? "Settings" : "Help and information"}
        >
          <div className="info-panel">
            {panel === "settings" ? (
              <>
                <div className="overline">MAKE YOURSELF AT HOME</div>
                <h2>Your preferences</h2>
                <p>No account required. Your library stays in this browser.</p>
                <label className="setting-row">
                  <span>
                    <strong>Preferred audio</strong>
                    <small>Availability depends on the player.</small>
                  </span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="eng">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="ben">Bangla</option>
                  </select>
                </label>
                <div className="setting-row">
                  <span>
                    <strong>Watch history</strong>
                    <small>{history.length} recently launched titles</small>
                  </span>
                  <button
                    className="button subtle"
                    onClick={() => {
                      setHistory([]);
                      setToast("Watch history cleared");
                    }}
                  >
                    <Trash2 size={15} />
                    Clear
                  </button>
                </div>
                <div className="setting-row">
                  <span>
                    <strong>Watchlist</strong>
                    <small>{saved.length} saved titles</small>
                  </span>
                  <button
                    className="button subtle"
                    onClick={() => {
                      if (
                        window.confirm("Remove all titles from your watchlist?")
                      ) {
                        setSaved([]);
                        setToast("Watchlist cleared");
                      }
                    }}
                  >
                    <Trash2 size={15} />
                    Clear
                  </button>
                </div>
                <div className="note">
                  This is a local profile, not a signed-in account. Clearing
                  your browser data removes your library.
                </div>
              </>
            ) : (
              <>
                <div className="overline">A LITTLE MORE ABOUT US</div>
                <h2>Welcome to your nest.</h2>
                <p>
                  ScreenNest helps you discover films and series and keep a
                  personal watchlist.
                </p>
                <h3>Catalog & availability</h3>
                <p>
                  {catalog.source === "demo"
                    ? "This deployment is using a curated demo catalog. Add a TMDB read access token in Vercel to enable live search and discovery."
                    : "Movie and TV information comes from TMDB."}{" "}
                  Screenscape publishes an embed player, not a documented
                  full-catalog API. A listed title does not guarantee an
                  available stream.
                </p>
                <h3>Third-party playback</h3>
                <p>
                  Players load only when you choose to launch them. Screenscape
                  controls stream availability, subtitles, ads, and playback.
                  ScreenNest does not host videos or bypass access restrictions.
                  Only access content you are authorized to watch.
                </p>
                <h3>Privacy & your library</h3>
                <p>
                  Your saved titles, preferred language, and launched-title
                  history stay in browser local storage. Images are loaded from
                  TMDB; live catalog searches are sent to TMDB through this
                  site. Launching a player or trailer connects to that third
                  party, which may use its own cookies.
                </p>
                <h3>Credits</h3>
                <p>
                  This product uses the TMDB API but is not endorsed or
                  certified by TMDB. Bundled promotional artwork comes from the
                  sources listed in the repository’s ASSETS.md; all artwork
                  belongs to its respective owners.
                </p>
                <div className="help-links">
                  <a
                    href="https://screenscape.me/embed"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Player documentation <ExternalLink size={14} />
                  </a>
                  <a
                    href="https://www.themoviedb.org"
                    target="_blank"
                    rel="noreferrer"
                  >
                    The Movie Database <ExternalLink size={14} />
                  </a>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function TitleDetail({
  title,
  initialPlay,
  saved,
  toggleSaved,
  language,
  onLaunch,
  resume,
}: {
  title: Title;
  initialPlay: boolean;
  saved: boolean;
  toggleSaved: () => void;
  language: string;
  onLaunch: (t: Title, s: number, e: number) => void;
  resume?: HistoryEntry;
}) {
  const [detail, setDetail] = useState(title);
  const [play, setPlay] = useState(initialPlay);
  const [launched, setLaunched] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const [season, setSeason] = useState(resume?.season || 1);
  const [episode, setEpisode] = useState(resume?.episode || 1);
  const [episodes, setEpisodes] = useState<
    { id: number; episode_number: number; name: string }[]
  >([]);
  const [message, setMessage] = useState("");
  const [fetching, setFetching] = useState(true);
  useEffect(() => {
    const c = new AbortController();
    fetch(`/api/catalog?mode=detail&type=${title.type}&id=${title.id}`, {
      signal: c.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.title) setDetail(d.title);
        else setMessage("Full details are unavailable right now.");
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setMessage("Full details are unavailable right now.");
      })
      .finally(() => {
        if (!c.signal.aborted) setFetching(false);
      });
    return () => c.abort();
  }, [title.id, title.type]);
  useEffect(() => {
    if (title.type !== "tv") return;
    const c = new AbortController();
    setEpisodes([]);
    fetch(`/api/catalog?mode=season&type=tv&id=${title.id}&season=${season}`, {
      signal: c.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.episodes) setEpisodes(d.episodes);
      })
      .catch(() => {});
    return () => c.abort();
  }, [title.id, title.type, season]);
  const url = embedUrl(title, season, episode, language);
  return (
    <div className="title-detail">
      {play ? (
        <div className="player-area">
          {launched ? (
            <iframe
              key={url}
              src={url}
              title={`Watch ${title.title}`}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
            />
          ) : (
            <div className="player-placeholder">
              <span className="player-circle">
                <Play size={31} fill="currentColor" />
              </span>
              <h2>Your next escape awaits.</h2>
              <p>
                Playback is provided by Screenscape. Availability and ads are
                controlled by the provider.
              </p>
              <button
                className="button primary"
                onClick={() => {
                  setLaunched(true);
                  onLaunch(title, season, episode);
                }}
              >
                <Play size={16} fill="currentColor" />
                Launch player
              </button>
              <small>Only watch content you have permission to access.</small>
            </div>
          )}
        </div>
      ) : trailer && detail.trailer ? (
        <div className="player-area">
          <iframe
            title={`${title.title} trailer`}
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(detail.trailer)}`}
            allow="fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          className="detail-backdrop"
          style={{
            backgroundImage: `linear-gradient(0deg,#151619,transparent),url('${title.id === 693134 ? "/images/dune-hero.jpg" : imageUrl(detail.backdrop, "w1280")}')`,
          }}
        >
          <span className="detail-type">
            {detail.type === "tv" ? "TELEVISION SERIES" : "FEATURE FILM"}
          </span>
        </div>
      )}
      <div className="detail-content">
        <div className="detail-heading">
          <div>
            <h2>{detail.title}</h2>
            <div className="detail-meta">
              <span>
                <Star size={14} fill="currentColor" />
                {detail.rating.toFixed(1)}
              </span>
              <span>{detail.year}</span>
              {detail.runtime && <span>{detail.runtime} min</span>}
              <span>{detail.type === "tv" ? "TV Series" : "Movie"}</span>
            </div>
          </div>
          <button
            className={`button subtle ${saved ? "saved" : ""}`}
            onClick={toggleSaved}
          >
            {saved ? <Check size={17} /> : <Plus size={17} />}
            <span>{saved ? "Saved" : "Watchlist"}</span>
          </button>
        </div>
        <p className="detail-overview">{detail.overview}</p>
        <div className="detail-genres">
          {detail.genres
            .map((id) => genres.find((g) => g.id === id))
            .filter(Boolean)
            .map((g) => (
              <span key={g!.id}>{g!.name}</span>
            ))}
        </div>
        {title.type === "tv" && (
          <div className="episode-controls">
            <label>
              Season
              {detail.seasons?.length ? (
                <select
                  value={season}
                  onChange={(e) => {
                    setSeason(Number(e.target.value));
                    setEpisode(1);
                    setLaunched(false);
                  }}
                >
                  {detail.seasons.map((s) => (
                    <option key={s.id} value={s.season_number}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  aria-label="Season number"
                  type="number"
                  min={1}
                  max={10000}
                  value={season}
                  onChange={(e) => {
                    setSeason(
                      Math.min(10000, Math.max(1, Number(e.target.value) || 1)),
                    );
                    setEpisode(1);
                    setLaunched(false);
                  }}
                />
              )}
            </label>
            <label>
              Episode
              {episodes.length ? (
                <select
                  value={episode}
                  onChange={(e) => {
                    setEpisode(Number(e.target.value));
                    setLaunched(false);
                  }}
                >
                  {episodes.map((e) => (
                    <option key={e.id} value={e.episode_number}>
                      {e.episode_number}. {e.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  aria-label="Episode number"
                  type="number"
                  min={1}
                  max={10000}
                  value={episode}
                  onChange={(e) => {
                    setEpisode(
                      Math.min(10000, Math.max(1, Number(e.target.value) || 1)),
                    );
                    setLaunched(false);
                  }}
                />
              )}
            </label>
            {!episodes.length && (
              <small>
                Episode listings unavailable. Enter a known season and episode.
              </small>
            )}
          </div>
        )}
        {!play && (
          <div className="detail-actions">
            <button
              className="button primary"
              onClick={() => {
                setPlay(true);
                setTrailer(false);
              }}
            >
              <Play size={17} fill="currentColor" />
              Watch now
            </button>
            {detail.trailer && (
              <button
                className="button subtle"
                onClick={() => setTrailer((t) => !t)}
              >
                {trailer ? "Close trailer" : "Watch trailer"}
                <ExternalLink size={15} />
              </button>
            )}
            {fetching && <LoaderCircle className="spinner" size={19} />}
          </div>
        )}
        {play && (
          <div className="playback-help">
            <span>
              <Volume2 size={15} />{" "}
              {language === "eng"
                ? "English"
                : language === "ben"
                  ? "Bangla"
                  : "Hindi"}{" "}
              preferred ·{" "}
              {title.type === "tv" ? `S${season} · E${episode}` : "Movie"}
            </span>
            {launched && (
              <button onClick={() => setLaunched(false)}>Reload player</button>
            )}
            <p>
              If playback is unavailable, try another server inside the player.
              This embedded view blocks popups and top-level redirects; some
              provider features may not work.
            </p>
            <a href={url} target="_blank" rel="noreferrer">
              Open on provider <ArrowUpRight size={13} />
            </a>
          </div>
        )}
        {message && (
          <p className="detail-note" role="status">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
