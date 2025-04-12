import { Link } from 'react-router-dom';
import styles from './NotFound.module.scss';

const NotFound = () => {
  return (
    <div className={styles.notFoundPage}>
      <div className={styles.backgroundPattern}></div>
      
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoWrapper}>
            <img
              src="https://cdn1.dizkon.ru/images/contests/2014/07/02/53b4428cef245.80.jpg"
              alt="Eventify Логотип"
              className={styles.logo}
            />
          </div>
          <h1 className={styles.appName}>Eventify</h1>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.illustration}>
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKJRIeGdfCoSnPh1wwajRqwjicPZS-n5YjmA&s" 
            alt="Страница не найдена" 
            className={styles.illustrationImage}
          />
        </div>
        
        <div className={styles.message}>
          <h2 className={styles.title}>Ой, страница потерялась!</h2>
          <p className={styles.description}>
            Мы обыскали все уголки, но не смогли найти то, что вы ищете.
            Возможно, неправильный адрес или страница была перемещена.
          </p>
          
          <div className={styles.actions}>
            <Link to="/" className={styles.primaryButton}>
              На главную
            </Link>
            <Link to="/events" className={styles.secondaryButton}>
              Все мероприятия
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;