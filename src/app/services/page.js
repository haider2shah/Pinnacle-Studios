import NavBar from '../components/navBar';
import styles from '../styles_css/servicesPage.module.css';
import ServicesCard from '../components/serviceCard';
import SecondServicesCard from '../components/secondServiceCard';
import ThirdServicesCard from '../components/thirdServiceCard';



export default function Services() {
  return (
    <>
        <div>
          <NavBar/>
        </div>


        <section className = {styles.sectionOne}>
            <ServicesCard
                title = "User Experience Design"
                paragraph = "It just works. Because we believe design should serve you, not distract you. Every motion, every moment is shaped to support your flow — so what you’re doing takes center stage, not how you’re doing it."
                image = "/UX image.png"
                imageMobile = "/UX mobile.png"
                iconParagraphOne={"With Figma, we design intuitive, user-focused interfaces that simplify workflows and bring your ideas to life."}
                iconParagraphTwo={"We test early and often, ensuring your product aligns with user behavior, expectations, and business outcomes."}
                iconParagraphThree={"We turn complex ideas into clean, responsive interfaces that feel natural, empowering users with every click and scroll."}
                icon = "/figmasvg.svg"
                iconTwo= "/user.svg"
                iconThree= "/UI.svg"
                iconHeadingOne = {"Figma"}
                iconHeadingTwo = {"User Research"}
                iconHeadingThree = {"UI Design"}
            />
        </section>

         <section className = {styles.sectionTwo}>
            <SecondServicesCard
                title = "Full - Stack Development"
                paragraph = "Built to feel effortless. Designed to disappear. You won’t see the systems. Or the code. Just the flow — fast, stable, and intuitive. Everything working quietly in the background, so you can stay focused on what matters."
                image = "/coding.png"
                imageMobile = "/Code mobile.png"
                iconParagraphOne={"Delivers fast, responsive interfaces that ensure fluid navigation and consistent experiences across all devices."}
                iconParagraphTwo={"Structured for growth, so your product evolves smoothly without breaking performance or maintainability."}
                iconParagraphThree={"Zero-downtime deployments maintain performance, so users never face disruption during feature or system updates."}
                icon = "/react white.svg"
                iconTwo = "/code white.svg"
                iconThree = "/cloud.svg"
                iconHeadingOne = {"React.js"}
                iconHeadingTwo = {"Scalable Code"}
                iconHeadingThree = {"Easy Deployment"}
            />
        </section>

         <section className = {styles.sectionThree}>
            <ThirdServicesCard
                title = "No - Code Development"
                paragraph = "Fully custom. Surprisingly simple.
With modern no-code platforms, we create smooth, responsive websites that scale — without writing a line of code. No complexity. No limits. Just clean, intuitive design that works."
                image = "/nocode.png"
                imageMobile = "/No code.png"
                iconParagraphOne={"Designed for speed, helping you launch quickly without compromising quality, responsiveness, or user experience."}
                iconParagraphTwo={"Empowers your team to update content or design instantly, without relying on developers or technical tools."}
                iconParagraphThree={"Structured to grow, ensuring your product handles new features and traffic without losing performance or stability."}
                icon = "/launch.svg"
                iconTwo = "/edit.svg"
                iconThree = "/scale.svg"
                iconHeadingOne = {"Fast Launches"}
                iconHeadingTwo = {"Easily Editable."}
                iconHeadingThree = {"Built to Scale"}
            />
        </section>


    </>



  );
}