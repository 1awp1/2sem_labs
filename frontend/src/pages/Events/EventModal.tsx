import { useState, useEffect } from "react";
import { Event, EventFormValues } from "@/types/event";
import styles from "./EventModal.module.scss";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormValues) => void;
  event?: Event | null;
  categories: string[];
}

export default function EventModal({
  isOpen,
  onClose,
  onSubmit,
  event,
  categories,
}: EventModalProps) {
  const [formData, setFormData] = useState<EventFormValues>({
    title: "",
    description: "",
    date: "",
    category: "другое",
  });

  const [errors, setErrors] = useState({
    title: "",
    description: "",
    date: "",
    category: "",
  });

  // Эффект для блокировки скролла фона
  useEffect(() => {
    if (isOpen) {
      // Запоминаем текущее положение скролла
      const scrollY = window.scrollY;
      // Блокируем скролл на body
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        // Восстанавливаем скролл при закрытии модалки
        const scrollY = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      };
    }
  }, [isOpen]);

  // Обработчик для предотвращения скролла при тачпадных жестах
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // Разрешаем скролл только внутри модального контента
    const target = e.target as HTMLElement;
    const isScrollable = target.scrollHeight > target.clientHeight;

    if (!isScrollable) {
      e.preventDefault();
    }
  };

  // Инициализация и сброс формы
  useEffect(() => {
    const initialDescription = event?.description || "";
    setFormData({
      title: event?.title || "",
      description: initialDescription,
      date: event?.date?.split("T")[0] || "",
      category: event?.category || "другое",
    });
    setErrors({
      title: "",
      description: "",
      date: "",
      category: "",
    });
  }, [event, isOpen]);

  const validateForm = (): boolean => {
    const newErrors = {
      title: "",
      description: "",
      date: "",
      category: "",
    };
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = "Название обязательно";
      isValid = false;
    } else if (formData.title.length >= 255) {
      newErrors.title = "Максимальная длина названия - 255 символов";
      isValid = false;
    }

    const descriptionLength = formData.description?.length || 0;
    if (descriptionLength > 600) {
      newErrors.description = "Максимальная длина описания - 600 символов";
      isValid = false;
    }

    if (!formData.date) {
      newErrors.date = "Дата обязательна";
      isValid = false;
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Дата не может быть в прошлом";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "description") {
      const safeValue = value || "";
      if (safeValue.length > 600) return;
      setFormData((prev) => ({ ...prev, [name]: safeValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const submitData = {
        ...formData,
        description: formData.description || undefined,
      };
      onSubmit(submitData);
    }
  };

  if (!isOpen) return null;

  const descriptionLength = formData.description?.length || 0;

  return (
    <div
      className={styles.modalOverlay}
      onTouchMove={handleTouchMove} // Добавляем обработчик тач-событий
    >
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2>{event ? "Редактировать мероприятие" : "Создать мероприятие"}</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Название *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={300}
            />
            {errors.title && <span className={styles.error}>{errors.title}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Описание</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={4}
              maxLength={600}
              className={styles.descriptionTextarea}
            />
            <div className={styles.charCounter}>{descriptionLength}/600 символов</div>
            {errors.description && <span className={styles.error}>{errors.description}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Дата *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
            />
            {errors.date && <span className={styles.error}>{errors.date}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Категория *</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Отмена
            </button>
            <button type="submit" className={styles.submitButton}>
              {event ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
