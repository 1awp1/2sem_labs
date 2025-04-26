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
  const formatCreatorName = () => {
    if (!event.creator) {
      // Если creator отсутствует, но есть createdBy, показываем ID
      return event.createdBy ? `ID: ${event.createdBy}` : "Неизвестный автор";
    }

    const { name, lastName } = event.creator;
    // Формируем полное имя, проверяя наличие lastName
    return `${name}${lastName ? ` ${lastName}` : ""}`.trim();
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
        <span>Автор: {formatCreatorName()}</span>
      </div>
    </div>
  );
}
