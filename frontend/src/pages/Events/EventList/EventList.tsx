import { Event } from '../../../types/event';
import EventCard from '../EventCard/EventCard';
import styles from './EventList.module.scss';

interface EventListProps {
  events: Event[];
  currentUserId?: number | null;
  onEdit?: (eventId: number) => void;
  onDelete?: (eventId: number) => void;
}

export default function EventList({ events, currentUserId, onEdit, onDelete }: EventListProps) {
  return (
    <div className={styles.list}>
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          isOwner={event.createdBy === currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}