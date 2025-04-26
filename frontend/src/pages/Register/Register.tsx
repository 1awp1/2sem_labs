import styles from "./Register.module.scss";
import RegisterForm from "./components/RegisterForm";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className={styles.registerPage}>
      <div className={styles.backgroundAnimation}></div>

      <div className={styles.registerContainer}>
        <div className={styles.logoSection}>
          <img
            src="https://cdn1.dizkon.ru/images/contests/2014/07/02/53b4428cef245.80.jpg"
            alt="Логотип"
            className={styles.logo}
          />
          <h1 className={styles.title}>
            Создайте аккаунт в <span>Eventify</span>
          </h1>
          <p className={styles.subtitle}>
            Присоединяйтесь к платформе для управления мероприятиями
          </p>
        </div>

        <div className={styles.formSection}>
          <RegisterForm />

          <div className={styles.loginLink}>
            Уже есть аккаунт? <Link to="/login">Войдите</Link>
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

export default Register;
