import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuthData } from "@utils/localStorageUtils";
import styles from "./Login.module.scss";
import LoginForm from "./components/LoginForm";
import { verifyToken } from "@api/authService";

const Login = () => {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authData = getAuthData();
      if (!authData?.token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const isValid = await verifyToken(authData.token);
        if (isValid) {
          navigate("/events");
        } else {
          localStorage.removeItem("auth");
        }
      } catch {
        localStorage.removeItem("auth");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isCheckingAuth) {
    return <div className={styles.loading}>Проверка авторизации...</div>;
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.backgroundAnimation}></div>

      <div className={styles.loginContainer}>
        <div className={styles.logoSection}>
          <img
            src="https://cdn1.dizkon.ru/images/contests/2014/07/02/53b4428cef245.80.jpg"
            alt="Логотип"
            className={styles.logo}
          />
          <h1 className={styles.title}>
            Добро пожаловать в <span>Eventify</span>
          </h1>
          <p className={styles.subtitle}>Войдите, чтобы управлять своими мероприятиями</p>
        </div>

        <div className={styles.formSection}>
          <LoginForm />

          <div className={styles.registerLink}>
            Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
            <br></br>
            <Link to="/" className={styles.homeButton}>
              На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
