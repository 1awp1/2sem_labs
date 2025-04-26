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
  email?: string;
  username?: string;
  general?: string;
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

  useEffect(() => {
    if (user) {
      setFormData(user);
      setErrors({});
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData?.name?.trim()) {
      newErrors.name = "Имя обязательно";
    } else if (/^\d/.test(formData.name)) {
      newErrors.name = "Имя не должно начинаться с цифры";
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
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{user.email}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Username:</span>
            <span className={styles.value}>{user.username}</span>
          </div>
        </div>
      )}
    </div>
  );
}