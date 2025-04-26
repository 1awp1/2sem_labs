import { useAuth } from "@utils/localStorageUtils";
import { useNavigate } from "react-router-dom";
import styles from "./LogoutButton.module.scss"; // Создайте файл стилей

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Вы уверены, что хотите выйти?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };
  return (
    <button onClick={handleLogout} className={styles.logoutButton}>
      Выйти
    </button>
  );
};

export default LogoutButton;
