import { Event } from '@/types/event';
import styles from './EventCard.module.scss';

interface EventCardProps {
  event: Event;
  isOwner?: boolean;
  onEdit?: (eventId: number) => void;
  onDelete?: (eventId: number) => void;
}

export default function EventCard({ event, isOwner, onEdit, onDelete }: EventCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>{event.title}</h3>
        {isOwner && (
          <div className={styles.cardActions}>
            {onEdit && (
              <button 
                onClick={() => onEdit(event.id)}
                className={styles.editButton}
              >
                Редактировать
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(event.id)}
                className={styles.deleteButton}
              >
                Удалить
              </button>
            )}
          </div>
        )}
      </div>
      
      <p className={styles.description}>{event.description}</p>
      
      <div className={styles.meta}>
        <span>Категория: {event.category}</span>
        <span>Дата: {new Date(event.date).toLocaleDateString()}</span>
        {event.creator && <span>Автор: {event.creator.name}</span>}
      </div>
    </div>
  );
}