import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { updateUser } from "@/api/authService";
import styles from "./ProfileModal.module.scss";
import { getAuthData } from "@/utils/localStorageUtils";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export default function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    username: user.username,
  });
  const [errors, setErrors] = useState({ name: "", email: "", username: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        username: user.username,
      });
    }
  }, [isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", username: "" };

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Некорректный email";
      isValid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username обязателен";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const authData = getAuthData();
      if (!authData?.token) throw new Error("Токен не найден");

      const updatedUser = await updateUser(
        user.id, // ID пользователя
        formData, // Данные для обновления
        authData.token // Токен авторизации
      );
      onUpdate(updatedUser);
      onClose();
    } catch (error) {
      console.error("Ошибка обновления профиля:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2>Редактировать профиль</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Имя *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <span className={styles.error}>{errors.username}</span>}
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Отмена
            </button>
            <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
