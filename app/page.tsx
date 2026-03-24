import Link from "next/link";
import { headers } from "next/headers";
import { detectLocale, getDict } from "../lib/i18n";

export default async function HomePage() {
  const hdrs = await headers();
  const locale = detectLocale(hdrs.get("accept-language"));
  const t = getDict(locale);

  const features = [
    { title: t.feat1Title, description: t.feat1Desc },
    { title: t.feat2Title, description: t.feat2Desc },
    { title: t.feat3Title, description: t.feat3Desc },
  ];

  return (
    <main className="landing-page">
      <section className="hero card">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{t.heroTitle}</h1>
        <p className="hero-copy">{t.heroCopy}</p>

        <div className="hero-actions">
          <Link className="button primary" href="/chat">
            {t.ctaChat}
          </Link>
          <a className="button secondary" href="#features">
            {t.ctaFeatures}
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
