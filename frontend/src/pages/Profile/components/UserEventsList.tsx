import { Event } from "@/types/event";
import EventCard from "@/pages/Events/EventCard/EventCard";
import styles from "./UserEventsList.module.scss";

interface UserEventsListProps {
  events: Event[];
}

export default function UserEventsList({ events }: UserEventsListProps) {
  if (events.length === 0) {
    return <div className={styles.empty}>У вас пока нет мероприятий</div>;
  }

  return (
    <div className={styles.eventsList}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} onEdit={() => {}} onDelete={() => {}} />
      ))}
    </div>
  );
}
