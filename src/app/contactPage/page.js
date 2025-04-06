

import ContactForm from '../components/contactForm';
import styles from '../styles_css/contactPage.module.css';


export default function ContactUsPage() {
    return (
      <main className= {styles.mainContainer}>
        <p className = {`${styles.paragraph} blackColor`}>CONTACT US</p>
        <h1 className = {styles.h1}>Feel free to use the form or <br/> drop us an email.</h1>
        <p className = {`${styles.lastParagraph} blackColor`}>We’re always thrilled to hear from you. <br/>
          Email: haider@pinnaclestudios.co
        </p>
        <ContactForm />
      </main>
    );
}
