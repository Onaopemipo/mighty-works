import {
  Clock3,
  MapPin,
} from "lucide-react";

const conferenceDays = [
  {
    number: "01",
    weekday: "Saturday",
    date: "7 November 2026",
    shortDate: "07 NOV",
    time: "5:00 PM",
  },
  {
    number: "02",
    weekday: "Sunday",
    date: "8 November 2026",
    shortDate: "08 NOV",
    time: "9:00 AM",
  },
] as const;

export function ScheduleV2() {
  return (
    <section
      id="schedule"
      className="mw-schedule-v3"
    >
      <div
        className="mw-schedule-v3-atmosphere"
        aria-hidden="true"
      >
        <div className="mw-schedule-v3-glow" />
        <div className="mw-schedule-v3-grid" />
        <div className="mw-schedule-v3-orbit mw-schedule-v3-orbit-one" />
        <div className="mw-schedule-v3-orbit mw-schedule-v3-orbit-two" />
      </div>

      <div className="mw-schedule-v3-shell">
        <header className="mw-schedule-v3-opening">
          <div className="mw-schedule-v3-opening-meta">
            <p>
              The conference
            </p>

            <span>
              07 — 08 November 2026
            </span>
          </div>

          <h2>
            The gathering
            <span>
              has a time.
            </span>
          </h2>

          <div className="mw-schedule-v3-opening-foot">
            <p>
              Two days set apart for
              worship, the Word, prayer
              and impartation.
            </p>

            <span>
              Greater Things
              <br />
              John 14:12
            </span>
          </div>
        </header>

        <section
          className="mw-schedule-v3-days"
          aria-label="Conference days"
        >
          <div
            className="mw-schedule-v3-spine"
            aria-hidden="true"
          >
            <i />
          </div>

          {conferenceDays.map(
            (day, index) => (
              <article
                key={day.number}
                className={[
                  "mw-schedule-v3-day",
                  index % 2 === 0
                    ? "is-left"
                    : "is-right",
                ].join(" ")}
              >
                <div className="mw-schedule-v3-day-marker">
                  <span>
                    Day {day.number}
                  </span>

                  <i />
                </div>

                <div className="mw-schedule-v3-day-body">
                  <p>
                    {day.shortDate}
                  </p>

                  <h3>
                    {day.weekday}
                  </h3>

                  <span>
                    {day.date}
                  </span>

                  <div className="mw-schedule-v3-time">
                    <Clock3
                      size={17}
                      strokeWidth={1.5}
                    />

                    <strong>
                      {day.time}
                    </strong>
                  </div>
                </div>
              </article>
            )
          )}
        </section>

        <section className="mw-schedule-v3-venue">
          <div className="mw-schedule-v3-venue-kicker">
            <MapPin
              size={18}
              strokeWidth={1.5}
            />

            <span>
              Where we gather
            </span>
          </div>

          <div className="mw-schedule-v3-venue-body">
            <h3>
              Faith Center
            </h3>

            <address>
              62 Eastern Rd
              <br />
              Browns Plains QLD 4118
            </address>
          </div>
        </section>

        <footer className="mw-schedule-v3-finale">
          <p>
            Two days.
          </p>

          <h3>
            One gathering.
            <span>
              Greater things.
            </span>
          </h3>

          <div className="mw-schedule-v3-finale-line">
            <i />
          </div>
        </footer>
      </div>
    </section>
  );
}
