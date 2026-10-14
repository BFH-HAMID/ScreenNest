import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty-state" style={{ minHeight: "100vh", border: 0 }}>
      <span className="overline">SCREENNEST · 404</span>
      <h1>This story took a wrong turn.</h1>
      <p>That page isn’t in our collection. There’s plenty more to discover.</p>
      <Link href="/" className="button primary">
        Back to the nest
      </Link>
    </main>
  );
}
