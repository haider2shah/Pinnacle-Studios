import NavBar from '../components/navBar';
import styles from '../styles_css/servicesPage.module.css';
import ServicesCard from '../components/serviceCard';

export default function Services() {
  return (
    <>
        <div>
          <NavBar/>
        </div>

        <section className = {styles.sectionOne}>
            <ServicesCard
                title = "User Experience Design"
                paragraph = "We design experiences that anticipate needs before they’re felt. Every detail — from layout to motion — is engineered for clarity, speed, and delight. By blending human insight with intelligent design, we craft interfaces that not only work beautifully but feel invisible. Because great design doesn’t just look good — it just works."
                image = "/ipad.png"
            />
        </section>

        <section className = {styles.sectionTwo}>
            <ServicesCard
                title = "Bespoke Web Development"
                paragraph = "We design websites, web apps, eCommerce platforms, SaaS products, and custom software(s) for a seamless and engaging user experience."
                image = "/ipad.png"
            />
        </section>

        <section className = {styles.sectionThree}>
            <ServicesCard
                title = "No - Code Web Development"
                paragraph = "We design websites, web apps, eCommerce platforms, SaaS products, and custom software(s) for a seamless and engaging user experience."
                image = "/ipad.png"
            />
        </section>
    </>



  );
}