import { useState } from "react";
import { Event } from "@/types/event";
import styles from "./EventCard.module.scss";

interface EventCardProps {
  event: Event;
  isOwner?: boolean;
  onEdit?: (eventId: number) => void;
  onDelete?: (eventId: number) => void;
}

export default function EventCard({ event, isOwner, onEdit, onDelete }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDescriptionOverflow, setIsDescriptionOverflow] = useState(false);

  // Проверяем, нужно ли показывать кнопку "Читать далее"
  const checkTextOverflow = (el: HTMLParagraphElement | null) => {
    if (el) {
      setIsDescriptionOverflow(el.scrollHeight > el.clientHeight);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleWrapper}>
          <h3>{event.title}</h3>
          <span className={styles.category}>{event.category}</span>
        </div>

        {isOwner && (
          <div className={styles.cardActions}>
            {onEdit && (
              <button
                onClick={() => onEdit(event.id)}
                className={`${styles.button} ${styles.editButton}`}
              >
                Редактировать
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(event.id)}
                className={`${styles.button} ${styles.deleteButton}`}
              >
                Удалить
              </button>
            )}
          </div>
        )}
      </div>

      {event.description && (
        <>
          <p
            ref={checkTextOverflow}
            className={`${styles.description} ${isExpanded ? styles.expanded : ""}`}
          >
            {event.description}
          </p>
          {isDescriptionOverflow && (
            <button className={styles.expandButton} onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Свернуть" : "Читать далее"}
            </button>
          )}
        </>
      )}

      <div className={styles.meta}>
        <span>Дата: {new Date(event.date).toLocaleDateString()}</span>
        {event.creator && <span>Автор: {event.creator.name}</span>}
      </div>
    </div>
  );
}
