import { Link } from 'react-router-dom';
import { useAuth } from '@/utils/localStorageUtils';
import styles from './HomeComponents.module.scss';

const HomeComponents = () => {
  useAuth();

  return (
    <div className={styles.container}>
        <div className={styles.actions}>
        <Link to="/events" className={styles.primaryButton}>
          Смотреть мероприятия
        </Link>
      </div>
      <h1 className={styles.title}>Добро пожаловать в Eventify!</h1>
      <p className={styles.subtitle}>Лучшая платформа для управления мероприятиями</p>
      
      <div className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📅</div>
          <h3>Создавайте мероприятия</h3>
          <p>Легко организуйте и управляйте своими событиями</p>
        </div>
        
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>👥</div>
          <h3>Приглашайте друзей</h3>
          <p>Привлекайте участников и расширяйте аудиторию</p>
        </div>
        
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>📊</div>
          <h3>Отслеживайте статистику</h3>
          <p>Мониторьте активность в режиме реального времени</p>
        </div>
      </div>
    </div>
  );
};

export default HomeComponents;