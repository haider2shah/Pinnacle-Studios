import styles from '../styles_css/form.module.css';


const ContactForm = () => {
  return (
  <div className={styles.card}>
    <form className={styles.form}>
      <div>
        <input
          type="text"
          id="name"
          className={styles.input}
          placeholder="Full Name*"
        />
      </div>

      <div>
        <input
          type="email"
          id="email"
          className={styles.input}
          placeholder="Email address*"
        />
      </div>

      <div>
        <textarea
          id="message"
          className={styles.textarea}
          placeholder="Type your message*"
        />
      </div>

      <button type="submit" className={styles.button}>Submit</button>
    </form>
  </div>
  );
};

export default ContactForm;
