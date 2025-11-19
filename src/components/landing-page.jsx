import React from "react";
import styles from "./styles/landing-page.module.css";

const exploreCards = [
  {
    title: "Featured projects",
    text: "Hand-picked builds from students shipping production-ready work.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    title: "Top rated students",
    text: "Rising talent consistently earning great feedback from clients.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    title: "Testimonials",
    text: "Hear from teams that hired students for real-world projects.",
    image: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
];

const successCards = [
  {
    title: "Landed my first paid client.",
    text: "Shipped an MVP in two weeks and got a long-term contract.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    title: "Portfolio made the difference.",
    text: "The work I did here directly led to three interviews.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    title: "Built confidence with real users.",
    text: "Nothing beats the feedback loop from actual clients.",
    image: "https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
];

export default function LandingPage() {
  const title = "Grow beyond the classroom, freelance your way";
  const currentYear = new Date().getFullYear();

  return (
    <>
      <div className={styles.fixedLayer}>
        <div className={styles.fixedOverlay}></div>
        <div className={styles.fixedCircle1}></div>
        <div className={styles.fixedCircle2}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.overlay}></div>
        <div className={styles.decorativeCircle1}></div>
        <div className={styles.decorativeCircle2}></div>

        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>Find real clients, ship real work, build a portfolio that wins.</p>
          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.buttonPrimary}
              onClick={() => {
                window.location.hash = "#/register";
              }}
            >
              Sign Up
            </button>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={() => {
                window.location.hash = "#/login";
              }}
            >
              Login
            </button>
          </div>
        </div>

        <div className={`${styles.accentBar} ${styles.accentBarOne}`}></div>
        <div className={`${styles.accentBar} ${styles.accentBarTwo}`}></div>
        <div className={`${styles.accentBar} ${styles.accentBarThree}`}></div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Explore</h2>
        <p className={styles.sectionSubline}>What peers are building and where you can stand out</p>
        <div className={styles.cardsGrid}>
          {exploreCards.map((card) => (
            <article key={card.title} className={styles.card}>
              <img className={styles.cardImage} src={card.image} alt={card.title} />
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>{card.title}</div>
                <div className={styles.cardText}>{card.text}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Success Stories</h2>
        <p className={styles.sectionSubline}>Real student wins</p>
        <div className={styles.cardsGrid}>
          {successCards.map((card) => (
            <article key={card.title} className={styles.card}>
              <img className={styles.cardImage} src={card.image} alt={card.title} />
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>{card.title}</div>
                <div className={styles.cardText}>{card.text}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.brand}>CampusFreelance</div>
          <nav className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>About</a>
            <a href="#" className={styles.footerLink}>Contact</a>
            <a href="#" className={styles.footerLink}>Admin</a>
            <a href="#" className={styles.footerLink}>Policy</a>
          </nav>
          <div className={styles.copyright}> {currentYear} All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
