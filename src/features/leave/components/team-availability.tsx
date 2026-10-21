import { Avatar } from "@/components/ui/primitives";
import type { Employee } from "@/types/api";

export function TeamAvailability({ teammates }: { teammates: Employee[] }) {
  return (
    <section className="panel availability-card">
      <div className="panel-head">
        <div><h3>Team availability</h3><p>Today</p></div>
      </div>
      <div className="availability-list">
        {teammates.map((e) => (
          <div key={e.name}>
            <Avatar initials={e.initials} size="small" />
            <span><strong>{e.name}</strong><small>{e.availability}</small></span>
            <i className={e.availability === "On leave" ? "away" : "online"} aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}
