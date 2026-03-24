import Link from "next/link";

const features = [
  {
    title: "Website widget ready",
    description: "A simple chat experience you can adapt into an embeddable support or sales widget.",
  },
  {
    title: "API route included",
    description: "A stubbed /api/chat endpoint is ready for wiring to OpenAI, Anthropic, or your own backend.",
  },
  {
    title: "Tiny MVP footprint",
    description: "Just enough UI and structure to run locally, demo quickly, and extend later.",
  },
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <section className="hero card">
        <span className="eyebrow">Minimal MVP</span>
        <h1>Launch a website chat agent fast.</h1>
        <p className="hero-copy">
          This starter gives you a clean landing page, a lightweight chat UI, and a
          working API route stub so you can start building your own website assistant.
        </p>

        <div className="hero-actions">
          <Link className="button primary" href="/chat">
            Open chat demo
          </Link>
          <a className="button secondary" href="#features">
            See what&apos;s included
          </a>
        </div>
      </section>

      <section id="features" className="feature-grid">
        {features.map((feature) => (
          <article key={feature.title} className="card feature-card">
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
