import styles from './Home.module.scss';
import { useAuth } from '@/utils/localStorageUtils';
import { Link, useNavigate } from 'react-router-dom';
import HomeComponents from './components/HomeComponents';

export default function Home() {
  const { isAuthenticated, getAuthData, logout } = useAuth();
  const authData = getAuthData();
  const username = authData?.user.username || authData?.user.name;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <Link to="/" className={styles.logoContainer}>
          <img 
            src="https://cdn-icons-png.flaticon.com/512/3652/3652191.png" 
            alt="Eventify Logo" 
            className={styles.logoImage}
          />
          <span className={styles.logoText}>Eventify</span>
        </Link>
        <nav className={styles.nav}>
          {isAuthenticated() ? (
            <div className={styles.authSection}>
              <div className={styles.userInfo}>Добро пожаловать, {username}</div>
              <button 
                onClick={handleLogout} 
                className={styles.logoutButton}
              >
                Выйти
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.link}>Вход</Link>
              <Link to="/register" className={styles.link}>Регистрация</Link>
            </>
          )}
        </nav>
      </header>
      <main className={styles.main}>
        <HomeComponents />
      </main>
    </div>
  );
}