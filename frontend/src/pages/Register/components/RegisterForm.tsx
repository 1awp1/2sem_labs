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
  } = useForm<RegisterFormValues>();

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    setError("");

    try {
      await apiRegister({
        name: values.name,
        email: values.email.trim(),
        username: values.username.trim(),
        password: values.password.trim(),
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
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          {...register("name", { required: "Name is required" })}
          placeholder="Full Name"
          disabled={isSubmitting}
        />
        {errors.name && <span className={styles.errorMessage}>{errors.name.message}</span>}
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

      <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
