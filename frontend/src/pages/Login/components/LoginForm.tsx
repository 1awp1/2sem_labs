//LoginForm.tsx
import { useForm } from "react-hook-form";
import { LoginFormValues } from "@/types/user";
import { useAuth } from "@utils/localStorageUtils";
import { useNavigate } from "react-router-dom";
import styles from "./LoginForm.module.scss";
import { useState } from "react";
import { AxiosError } from "axios";
import { useAppDispatch } from "@/redux/hook";
import { loginUser } from "@/redux/slices/authSlice";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>();

  useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setError("");

    try {
      await dispatch(
        loginUser({
          email: values.email.trim(),
          password: values.password.trim(),
        })
      ).unwrap();
      navigate("/events");
    } catch (error: unknown) {
      console.error("Login error:", error);
      const err = error as AxiosError<{ message?: string }>;

      if (err.response) {
        const errorMessage = err.response.data?.message || "Login failed";

        if (errorMessage.includes("заблокирован")) {
          setError("Ваш аккаунт временно заблокирован. Попробуйте позже.");
        } else if (errorMessage.includes("Неверный email или пароль")) {
          setError("Неверный email или пароль. Пожалуйста, попробуйте снова.");
        } else {
          setError(errorMessage);
        }
      } else if (err.request) {
        setError("Не удалось подключиться к серверу. Проверьте интернет-соединение.");
      } else {
        setError("Неверный email или пароль");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // Важное изменение - предотвращаем перезагрузку здесь
        handleSubmit(onSubmit)();
      }}
      className={styles.form}
      noValidate // Добавляем атрибут noValidate
    >
      {error && <div className={styles.error}>{error}</div>}

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
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
          placeholder="Password"
          disabled={isSubmitting}
        />
        {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
