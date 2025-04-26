import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./UserInfo.module.scss";

interface UserInfoProps {
  user: User | null;
  onUpdate?: (updatedUser: User) => Promise<void>;
  editable?: boolean;
}

interface FormErrors {
  name?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  username?: string;
  general?: string;
  gender?: string;
  birthDate?: string;
}
interface ServerErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

interface AxiosError {
  response?: {
    data?: ServerErrorResponse;
    status?: number;
  };
  request?: unknown;
  message?: string;
}

export default function UserInfo({ user, onUpdate, editable = false }: UserInfoProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<User | null>(user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [fieldsDisabled, setFieldsDisabled] = useState(false);

  // Регулярное выражение для проверки русских и английских букв
  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ]+$/;

  useEffect(() => {
    if (user) {
      setFormData(user);
      setErrors({});
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (fieldsDisabled) return;

    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Валидация пола
    if (!formData?.gender) {
      newErrors.gender = "Укажите пол";
    }
    // Валидация даты рождения
    if (!formData?.birthDate) {
      newErrors.birthDate = "Укажите дату рождения";
    } else if (new Date(formData.birthDate) >= new Date()) {
      newErrors.birthDate = "Дата рождения должна быть в прошлом";
    }

    // Валидация имени
    if (!formData?.name?.trim()) {
      newErrors.name = "Имя обязательно";
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = "Имя может содержать только буквы и дефисы";
    } else if (formData.name.trim().length === 0) {
      newErrors.name = "Имя не может состоять только из пробелов";
    }

    // Валидация фамилии
    if (!formData?.lastName?.trim()) {
      newErrors.lastName = "Фамилия обязательна";
    } else if (!nameRegex.test(formData.lastName)) {
      newErrors.lastName = "Фамилия может содержать только буквы и дефисы";
    } else if (formData.lastName.trim().length === 0) {
      newErrors.lastName = "Фамилия не может состоять только из пробелов";
    }

    // Валидация отчества (если заполнено)
    if (formData?.middleName && formData.middleName.trim()) {
      if (!nameRegex.test(formData.middleName)) {
        newErrors.middleName = "Отчество может содержать только буквы и дефисы";
      }
    } else if (formData?.middleName && formData.middleName.trim().length === 0) {
      newErrors.middleName = "Отчество не может состоять только из пробелов";
    }

    if (!formData?.email?.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Некорректный формат email";
    }

    if (!formData?.username?.trim()) {
      newErrors.username = "Username обязателен";
    } else if (/\s/.test(formData.username)) {
      newErrors.username = "Username не должен содержать пробелы";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !onUpdate || fieldsDisabled) return;

    if (!validateForm()) return;

    setFieldsDisabled(true);
    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, general: undefined }));
    setShowSuccess(false);

    try {
      await onUpdate(formData);

      setShowSuccess(true);
      toast.success("Данные профиля успешно обновлены!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      setTimeout(() => {
        setEditMode(false);
        setShowSuccess(false);
        setFieldsDisabled(false);
      }, 1000);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      let errorMessage = "Ошибка при обновлении профиля";

      // Handle 409 Conflict (email or username already taken)
      if (axiosError.response?.status === 409) {
        const serverErrors = axiosError.response.data?.errors || {};
        const newErrors: FormErrors = {};

        if (serverErrors.email) {
          newErrors.email = serverErrors.email.join(", ");
        }
        if (serverErrors.username) {
          newErrors.username = serverErrors.username.join(", ");
        }

        setErrors(newErrors);

        // Show specific toast messages
        if (newErrors.email) {
          toast.error(`Email уже занят: ${newErrors.email}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        }
        if (newErrors.username) {
          toast.error(`Username уже занят: ${newErrors.username}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
        }
        return;
      }

      // Handle other error cases
      if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.request) {
        errorMessage = "Не удалось соединиться с сервером";
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      setErrors({ general: errorMessage });
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setIsSubmitting(false);
      setFieldsDisabled(false);
    }
  };

  if (!user || !formData) return null;

  return (
    <div className={styles.userInfo}>
      <div className={styles.header}>
        <h1>Профиль пользователя</h1>
        {editable && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className={styles.editButton}
            disabled={isSubmitting || fieldsDisabled}
          >
            Редактировать
          </button>
        )}
      </div>

      {showSuccess && <div className={styles.successMessage}>Данные успешно обновлены!</div>}

      {errors.general && <div className={styles.errorMessage}>{errors.general}</div>}

      {editMode ? (
        <form onSubmit={handleSubmit} className={styles.editForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Имя:</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={errors.name ? styles.errorInput : ""}
              disabled={fieldsDisabled}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName">Фамилия:</label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={errors.lastName ? styles.errorInput : ""}
              disabled={fieldsDisabled}
            />
            {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="middleName">Отчество:</label>
            <input
              id="middleName"
              type="text"
              name="middleName"
              value={formData.middleName || ""}
              onChange={handleChange}
              className={errors.middleName ? styles.errorInput : ""}
              disabled={fieldsDisabled}
            />
            {errors.middleName && <span className={styles.errorText}>{errors.middleName}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={errors.email ? styles.errorInput : ""}
              disabled={fieldsDisabled}
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={errors.username ? styles.errorInput : ""}
              disabled={fieldsDisabled}
            />
            {errors.username && <span className={styles.errorText}>{errors.username}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="gender">Пол:</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              required
              className={errors.gender ? styles.errorInput : ""}
              disabled={fieldsDisabled}
            >
              <option value="">Выберите пол</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
              <option value="other">Другой</option>
            </select>
            {errors.gender && <span className={styles.errorText}>{errors.gender}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="birthDate">Дата рождения:</label>
            <input
              id="birthDate"
              type="date"
              name="birthDate"
              value={formData.birthDate || ""}
              onChange={handleChange}
              required
              max={new Date().toISOString().split("T")[0]}
              className={errors.birthDate ? styles.errorInput : ""}
              disabled={fieldsDisabled}
            />
            {errors.birthDate && <span className={styles.errorText}>{errors.birthDate}</span>}
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                if (!fieldsDisabled) {
                  setEditMode(false);
                  setErrors({});
                  setShowSuccess(false);
                }
              }}
              className={styles.cancelButton}
              disabled={fieldsDisabled}
            >
              Отмена
            </button>
            <button type="submit" disabled={fieldsDisabled} className={styles.saveButton}>
              {isSubmitting ? (
                <>
                  <span className={styles.spinner} />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.infoContainer}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Имя:</span>
            <span className={styles.value}>{user.name || "Не указано"}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Фамилия:</span>
            <span className={styles.value}>{user.lastName || "Не указано"}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Отчество:</span>
            <span className={styles.value}>{user.middleName || "Не указано"}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{user.email}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Username:</span>
            <span className={styles.value}>{user.username}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Пол:</span>
            <span className={styles.value}>
              {user.gender === "male"
                ? "Мужской"
                : user.gender === "female"
                  ? "Женский"
                  : user.gender === "other"
                    ? "Другой"
                    : "Не указано"}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Дата рождения:</span>
            <span className={styles.value}>
              {user.birthDate ? new Date(user.birthDate).toLocaleDateString("ru-RU") : "Не указана"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
