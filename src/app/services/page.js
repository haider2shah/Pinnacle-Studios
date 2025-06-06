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
                paragraph = "We design experiences that anticipate needs before they’re felt. Every detail — from layout to motion — is engineered for clarity, speed, and delight. By blending human insight with intelligent design, we craft interfaces that not only work beautifully but feel invisible. Because great design doesn’t just look good — it just works."
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

         <section className = {styles.sectionOne}>
            <SecondServicesCard
                title = "Full - Stack Development"
                paragraph = "We engineer full-stack applications with clean, scalable code — from responsive React UIs to secure backend systems. Our services include REST and GraphQL APIs, custom database schemas, authentication flows, and deployment pipelines. Every feature is thoughtfully built for speed, reliability, and flexibility — turning business logic into high-performance, production-ready digital products."
                image = "/coding.png"
                iconParagraphOne={"Delivers fast, responsive interfaces that ensure fluid navigation and consistent experiences across all devices."}
                iconParagraphTwo={"Structured for growth, so your product evolves smoothly without breaking performance or maintainability."}
                iconParagraphThree={"Zero-downtime deployments maintain performance, so users never face disruption during feature or system updates."}
                icon = "/react.svg"
                iconTwo = "/code.svg"
                iconThree = "/deploy.svg"
                iconHeadingOne = {"React.js"}
                iconHeadingTwo = {"Scalable Code"}
                iconHeadingThree = {"Easy Deployment"}
            />
        </section>

         <section className = {styles.sectionOne}>
            <ThirdServicesCard
                title = "No - Code Development"
                paragraph = "We build high-quality websites using no-code tools like Webflow and Framer — no coding required. From responsive layouts and smooth animations to CMS-powered content and fast performance, everything is custom-designed and easy to manage. You get a professional, scalable site that looks and works like a fully coded build — without the complexity."
                image = "/nocode.png"
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