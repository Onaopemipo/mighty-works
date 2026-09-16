import {
  BookOpen,
  Music2,
  Sparkles,
  UsersRound,
} from "lucide-react";

const experiences = [
  {
    title: "Worship",
    copy: "A global sound of unity and adoration.",
    icon: Music2,
    className: "worship",
  },
  {
    title: "Word",
    copy: "Biblical truth for today's nations.",
    icon: BookOpen,
    className: "word",
  },
  {
    title: "Prayer",
    copy: "A people who seek. A world that changes.",
    icon: Sparkles,
    className: "prayer",
  },
  {
    title: "Impartation",
    copy: "Be equipped. Be empowered. Go further.",
    icon: UsersRound,
    className: "impartation",
  },
];

export function ExperienceGrid() {
  return (
    <section
      id="experience"
      className="homev2-experience"
    >
      <div className="homev2-section-heading">
        <div>
          <p className="homev2-kicker">
            Experience Mighty Works
          </p>

          <h2>
            Worship. Word.
            <br />
            Prayer. Impartation.
          </h2>
        </div>

        <p>
          Encounter God.
          <br />
          Be equipped.
          <br />
          Make a difference.
        </p>
      </div>

      <div className="homev2-experience-grid">
        {experiences.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className={`homev2-experience-card ${item.className}`}
            >
              <div className="homev2-experience-icon">
                <Icon
                  size={42}
                  strokeWidth={1.7}
                />
              </div>

              <div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>

              <span className="homev2-card-arrow">
                →
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
