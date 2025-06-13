import NavBar from '../components/navBar';
import styles from '../styles_css/servicesPage.module.css';
import ServicesCard from '../components/serviceCard';
import SecondServicesCard from '../components/secondServiceCard';
import ThirdServicesCard from '../components/thirdServiceCard';
import Subsection1 from '../components/servicesSubSection1';
import Subsection from '../components/servicesSubSection';
import Subsection3 from '../components/servicesSubSection3';





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
            <Subsection1
                title="Design that tells your story"
                text="Design becomes powerful when it reflects more than style — when it captures identity, intention, and story in every interaction."
                cards={[
                    { image: '/hospitality.jpg', text: 'Hospitality' },
                    { image: '/tech.jpg', text: 'Start Ups' },
                    { image: '/event.jpg', text: 'Event Organizer' },
                    { image: '/test.jpg', text: 'Hiring Firms' },
                    { image: '/doc.jpg', text: 'Private Clinics' },
                    { image: '/test.jpg', text: 'Bio Tech' }
                    
                ]}
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
             <Subsection
                title="Architecture that scales with your ambition"
                text="True performance begins beneath the surface — in the way systems connect, scale, and stay reliable as your product grows."
                cards={[
                    { image: '/test.jpg', text: 'SaaS Dashboard' },
                    { image: '/test.jpg', text: 'Healthcare Platform' },
                    { image: '/test.jpg', text: 'E-Commerce Stack' },
                    { image: '/test.jpg', text: 'Learning Management System' },
                    { image: '/test.jpg', text: 'Banking App' },
                    { image: '/test.jpg', text: 'Booking System' }
                    
                ]}
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
             <Subsection3
                title="Freedom to launch. Power to grow."
                text="No-code isn’t a shortcut. It’s a smarter way to build — combining speed, flexibility, and craftsmanship in one scalable system."
                cards={[
                    { image: '/product.jpg', text: 'Product Landing Pages' },
                    { image: '/estate.jpg', text: 'Real Estate Listings' },
                    { image: '/dining.jpg', text: 'Fine Dining Restaurants' },
                    { image: '/creative.jpg', text: 'Creative Agencies' },
                    { image: '/wellness.jpg', text: 'Wellness & Lifestyle Brands' },
                    { image: '/art.jpg', text: 'Art Galleries & Exhibitions' }
                    
                ]}
            />
        </section>


    </>



  );
}