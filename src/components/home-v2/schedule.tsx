import {
  Clock3,
  MapPin,
} from "lucide-react";

export function ScheduleV2() {
  return (
    <section
      id="schedule"
      className="homev2-schedule"
    >
      <div className="homev2-schedule-heading">
        <p className="homev2-kicker">
          The conference
        </p>

        <h2>
          <strong>2 days.</strong>
          One gathering.
        </h2>

        <span>
          Greater Things · John 14:12
        </span>
      </div>

      <div className="homev2-day-card">
        <p>Day 01</p>

        <h3>
          Saturday
          <span>
            7 November 2026
          </span>
        </h3>

        <div>
          <Clock3 size={16} />
          5:00 PM
        </div>
      </div>

      <div className="homev2-day-card">
        <p>Day 02</p>

        <h3>
          Sunday
          <span>
            8 November 2026
          </span>
        </h3>

        <div>
          <Clock3 size={16} />
          9:00 AM
        </div>
      </div>

      <div className="homev2-schedule-city">
        <div>
          <MapPin size={28} />

          <strong>
            Faith Center
          </strong>

          <span>
            62 Eastern Rd
            <br />
            Browns Plains QLD 4118
          </span>
        </div>
      </div>
    </section>
  );
}
