export type MediaType = "movie" | "tv";
export type Title = {
  id: number;
  type: MediaType;
  title: string;
  year: string;
  rating: number;
  poster: string;
  backdrop: string;
  overview: string;
  genres: number[];
  runtime?: number;
  seasons?: {
    id: number;
    season_number: number;
    episode_count: number;
    name: string;
  }[];
  trailer?: string;
};
export const genres = [
  { id: 0, name: "For you" },
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10749, name: "Romance" },
];
export const demo: Title[] = [
  {
    id: 693134,
    type: "movie",
    title: "Dune: Part Two",
    year: "2024",
    rating: 8.2,
    poster: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop: "/xOMo8BRK7PfcJvKaK2WZ3NQ0urK.jpg",
    overview:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. A choice between love and the fate of the universe awaits.",
    genres: [878, 12],
    runtime: 167,
  },
  {
    id: 872585,
    type: "movie",
    title: "Oppenheimer",
    year: "2023",
    rating: 8.1,
    poster: "/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
    backdrop: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    overview:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    genres: [18, 36],
    runtime: 181,
  },
  {
    id: 157336,
    type: "movie",
    title: "Interstellar",
    year: "2014",
    rating: 8.4,
    poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx2.jpg",
    backdrop: "/pbrkL804c8yAv3zBZR4QPEafpAR.jpg",
    overview:
      "A team of explorers travel beyond this galaxy to discover whether mankind has a future among the stars.",
    genres: [12, 18, 878],
    runtime: 169,
  },
  {
    id: 569094,
    type: "movie",
    title: "Spider-Man: Across the Spider-Verse",
    year: "2023",
    rating: 8.4,
    poster: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop: "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    overview:
      "Miles Morales is catapulted across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    genres: [16, 28, 12],
    runtime: 140,
  },
  {
    id: 940721,
    type: "movie",
    title: "Godzilla Minus One",
    year: "2023",
    rating: 7.6,
    poster: "/hkxxMIGaiCTmrEArK7J56JTKUlB.jpg",
    backdrop: "/jXJxMcVoEuXzym3vFnjqDW4ifo6.jpg",
    overview:
      "In postwar Japan, a new terror rises from the sea. A former fighter pilot joins a civilian effort to stop Godzilla.",
    genres: [28, 878, 18],
    runtime: 125,
  },
  {
    id: 763215,
    type: "movie",
    title: "Damsel",
    year: "2024",
    rating: 7.0,
    poster: "/AgHbB9DCE9aE57zkHjSmseszh6e.jpg",
    backdrop: "/deLWkOLZmBNkm8p16igfapQyqeq.jpg",
    overview:
      "A young woman agrees to marry a handsome prince, only to discover that the royal family has recruited her as a sacrifice to a fire-breathing dragon.",
    genres: [12, 14, 28],
    runtime: 110,
  },
  {
    id: 155,
    type: "movie",
    title: "The Dark Knight",
    year: "2008",
    rating: 8.5,
    poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    overview:
      "Batman faces a criminal mastermind known as the Joker, who plunges Gotham into anarchy and forces him closer to crossing the line between hero and vigilante.",
    genres: [28, 80, 18],
    runtime: 152,
  },
  {
    id: 129,
    type: "movie",
    title: "Spirited Away",
    year: "2001",
    rating: 8.5,
    poster: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    backdrop: "/6vcdZBbfFSD3DfBqaUOHwcdxN4i.jpg",
    overview:
      "A young girl enters a world ruled by gods, witches, and spirits, where humans are changed into beasts.",
    genres: [16, 14, 12],
    runtime: 125,
  },
  {
    id: 1091,
    type: "movie",
    title: "The Thing",
    year: "1982",
    rating: 8.1,
    poster: "/tzGY49kseSE9QAKk47uuDGwnSCu.jpg",
    backdrop: "/b6ZJZHUdMEFECvGiDpJjlfUWela.jpg",
    overview:
      "An Antarctic research team encounters a shape-shifting alien that assumes the appearance of its victims.",
    genres: [27, 878, 53],
    runtime: 109,
  },
  {
    id: 313369,
    type: "movie",
    title: "La La Land",
    year: "2016",
    rating: 7.9,
    poster: "/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
    backdrop: "/nlPCdZlHtRNcF6C9hzUH4ebmV1w.jpg",
    overview:
      "An aspiring actress and a dedicated jazz musician find love while pursuing their dreams in Los Angeles.",
    genres: [35, 18, 10749],
    runtime: 129,
  },
  {
    id: 1399,
    type: "tv",
    title: "Game of Thrones",
    year: "2011",
    rating: 8.5,
    poster: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    backdrop: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
    overview:
      "Seven noble families fight for control of the mythical land of Westeros, while an ancient enemy awakens in the far north.",
    genres: [18, 10765],
  },
  {
    id: 1396,
    type: "tv",
    title: "Breaking Bad",
    year: "2008",
    rating: 8.9,
    poster: "/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg",
    backdrop: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    overview:
      "A high school chemistry teacher diagnosed with terminal cancer turns to manufacturing methamphetamine to secure his family’s future.",
    genres: [18, 80, 53],
  },
  {
    id: 66732,
    type: "tv",
    title: "Stranger Things",
    year: "2016",
    rating: 8.6,
    poster: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    overview:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    genres: [18, 10765, 9648],
  },
  {
    id: 94997,
    type: "tv",
    title: "House of the Dragon",
    year: "2022",
    rating: 8.4,
    poster: "/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
    backdrop: "/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg",
    overview:
      "The Targaryen dynasty stands at the height of its power. But a struggle for succession threatens to tear the realm apart.",
    genres: [18, 10765, 10759],
  },
  {
    id: 100088,
    type: "tv",
    title: "The Last of Us",
    year: "2023",
    rating: 8.6,
    poster: "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    backdrop: "/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    overview:
      "Twenty years after modern civilization has been destroyed, a hardened survivor is hired to smuggle a fourteen-year-old girl out of an oppressive quarantine zone.",
    genres: [18, 10759],
  },
  {
    id: 1429,
    type: "tv",
    title: "Attack on Titan",
    year: "2013",
    rating: 8.7,
    poster: "/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
    backdrop: "/rqbCbjB19amtOtFQbb3K2lgm2zv.jpg",
    overview:
      "After his hometown is destroyed, young Eren Yeager vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.",
    genres: [16, 10759, 10765],
  },
];
export function imageUrl(path: string, size = "w500") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
}
export function embedUrl(
  title: Pick<Title, "id" | "type">,
  season = 1,
  episode = 1,
  language = "eng",
) {
  if (
    !Number.isInteger(title.id) ||
    title.id < 1 ||
    !["movie", "tv"].includes(title.type)
  )
    throw new Error("Invalid title");
  const p = new URLSearchParams({
    tmdb: String(title.id),
    type: title.type,
    lan: ["eng", "hindi", "ben"].includes(language) ? language : "eng",
  });
  if (title.type === "tv") {
    if (
      ![season, episode].every(
        (n) => Number.isInteger(n) && n > 0 && n <= 10000,
      )
    )
      throw new Error("Invalid episode");
    p.set("s", String(season));
    p.set("e", String(episode));
  }
  return `https://nxsha.screenscape.me/embed?${p}`;
}
export function matchesGenre(
  title: Pick<Title, "type" | "genres">,
  genre: number,
) {
  const mapped =
    title.type === "tv"
      ? genre === 28
        ? 10759
        : genre === 878
          ? 10765
          : genre
      : genre;
  return (
    !genre || title.genres.includes(genre) || title.genres.includes(mapped)
  );
}
export function demoCatalog(
  mode: string,
  type: string,
  query: string,
  genre: number,
) {
  let items = demo.filter(
    (t) =>
      (!type || t.type === type) &&
      (!query || t.title.toLowerCase().includes(query.toLowerCase())) &&
      (!genre ||
        t.genres.includes(genre) ||
        (type === "tv" && genre === 28 && t.genres.includes(10759)) ||
        (type === "tv" && genre === 878 && t.genres.includes(10765))),
  );
  if (mode === "top_rated")
    items = [...items].sort((a, b) => b.rating - a.rating);
  return items;
}

export const localPosters: Record<string, string> = {
  "movie-693134": "/images/movie-693134.webp",
  "movie-872585": "/images/movie-872585.webp",
  "movie-157336": "/images/movie-157336.webp",
  "movie-569094": "/images/movie-569094.webp",
  "movie-940721": "/images/movie-940721.webp",
  "movie-763215": "/images/movie-763215.webp",
  "tv-1399": "/images/tv-1399.webp",
  "tv-1396": "/images/tv-1396.webp",
  "tv-66732": "/images/tv-66732.webp",
  "tv-94997": "/images/tv-94997.webp",
  "tv-100088": "/images/tv-100088.webp",
  "tv-1429": "/images/tv-1429.webp",
};
