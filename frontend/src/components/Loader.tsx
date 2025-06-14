import styles from "./Loader.module.scss";

export default function Loader() {
  return (
    <div className={styles.loader}>
      <div className={styles.spinner}></div>
      <div className={styles.text}>Загрузка...</div>
    </div>
  );
}
