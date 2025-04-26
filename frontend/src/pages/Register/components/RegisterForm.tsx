import { useForm } from "react-hook-form";
import { RegisterFormValues } from "@/types/user";
import { register as apiRegister } from "@api/authService";
import { useNavigate } from "react-router-dom";
import styles from "./RegisterForm.module.scss";
import { useState } from "react";
import { AxiosError } from "axios";

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<RegisterFormValues>();

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Регулярное выражение для проверки русских и английских букв и дефисов
  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ-]+$/;

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    setError("");

    // Проверяем все поля перед отправкой
    const isValid = await trigger();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await apiRegister({
        name: values.name,
        lastName: values.lastName,
        middleName: values.middleName || null,
        email: values.email.trim(),
        username: values.username.trim(),
        password: values.password.trim(),
        gender: values.gender,
        birthDate: values.birthDate,
      });
      navigate("/login");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      console.error("Registration error:", error);

      if (error.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Please try again later.");
      } else if (error.response) {
        setError(error.response.data?.message || "Registration failed");
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="name">Имя</label>
        <input
          id="name"
          {...register("name", {
            required: "Имя обязательно",
            pattern: {
              value: nameRegex,
              message: "Имя может содержать только буквы и дефисы",
            },
            validate: (value) => !!value.trim() || "Имя не может состоять только из пробелов",
          })}
          placeholder="Имя"
          disabled={isSubmitting}
        />
        {errors.name && <span className={styles.errorMessage}>{errors.name.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="lastName">Фамилия</label>
        <input
          id="lastName"
          {...register("lastName", {
            required: "Фамилия обязательна",
            pattern: {
              value: nameRegex,
              message: "Фамилия может содержать только буквы и дефисы",
            },
            validate: (value) => !!value.trim() || "Фамилия не может состоять только из пробелов",
          })}
          placeholder="Фамилия"
          disabled={isSubmitting}
        />
        {errors.lastName && <span className={styles.errorMessage}>{errors.lastName.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="middleName">Отчество</label>
        <input
          id="middleName"
          {...register("middleName", {
            pattern: {
              value: nameRegex,
              message: "Отчество может содержать только буквы и дефисы",
            },
            validate: (value) =>
              !value || !!value.trim() || "Отчество не может состоять только из пробелов",
          })}
          placeholder="Отчество (необязательно)"
          disabled={isSubmitting}
        />
        {errors.middleName && (
          <span className={styles.errorMessage}>{errors.middleName.message}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          placeholder="Email"
          disabled={isSubmitting}
        />
        {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          {...register("username", {
            required: "Username is required",
            minLength: {
              value: 3,
              message: "Username должен быть не меньше 3 символов",
            },
          })}
          placeholder="Username"
          disabled={isSubmitting}
        />
        {errors.username && <span className={styles.errorMessage}>{errors.username.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Пароль должен быть не меньше 8 символов",
            },
          })}
          placeholder="Password"
          disabled={isSubmitting}
        />
        {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="gender">Пол</label>
        <select
          id="gender"
          {...register("gender", {
            required: "Укажите пол",
          })}
          disabled={isSubmitting}
        >
          <option value="">Выберите пол</option>
          <option value="male">Мужской</option>
          <option value="female">Женский</option>
          <option value="other">Другой</option>
        </select>
        {errors.gender && <span className={styles.errorMessage}>{errors.gender.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="birthDate">Дата рождения</label>
        <input
          id="birthDate"
          type="date"
          {...register("birthDate", {
            required: "Укажите дату рождения",
            validate: (value) => {
              const selectedDate = new Date(value);
              const today = new Date();
              return selectedDate < today || "Дата рождения должна быть в прошлом";
            },
          })}
          max={new Date().toISOString().split("T")[0]}
          disabled={isSubmitting}
        />
        {errors.birthDate && (
          <span className={styles.errorMessage}>{errors.birthDate.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
