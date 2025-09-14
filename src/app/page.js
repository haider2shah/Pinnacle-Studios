import NavBar from './components/navBar';
import styles from './styles_css/home.module.css';
import Image from 'next/image';


export default function HomePage() {
  return (
    <>
        <div>
          <NavBar/>
        </div>

        <section className = {styles.sectionOne}>
            
            <h1 className = {styles.heading}> But Your website <br/>doesn’t have to be. </h1>

            <div className = {styles.images}>

              <Image className= {styles.imageOne} alt="About us image" width={0} height={0} src="/iphone.png" unoptimized priority/>

              <Image className= {styles.imageTwo} alt="About us image" width={0} height={0} src="/iphone.png" unoptimized priority/>

              <Image className= {styles.imageThree} alt="About us image" width={0} height={0} src="/iphone.png" unoptimized priority/>

              <Image className= {styles.imageFour} alt="About us image" width={0} height={0} src="/iphone.png" unoptimized priority/>

              <Image className= {styles.imageFive} alt="About us image" width={0} height={0} src="/iphone.png" unoptimized priority/>

            </div>
        </section>

        <section className = {styles.sectionTwo}>
            
            <h1 className = {styles.heading}> If You’re changing the world,<br/> the world should know. </h1>


            <Image className= {styles.collage} alt="About us image" width={0} height={0} src="/show the world.png" unoptimized priority/>

        </section>

        <section className = {styles.sectionThree}>
            
            <h1 className = {styles.heading}> Does your website reflect <br/> your vision for the future? </h1>


            <Image className= {styles.tablet} alt="About us image" width={0} height={0} src="/tablet.png" unoptimized priority/>

        </section>

        <section className = {styles.sectionFour}>
            
            <h1 className = {styles.heading}> Developing websites with <br/> world-class technology. </h1>

            <div className = {styles.Techimages}>

              <Image className= {styles.figma} alt="About us image" width={0} height={0} src="/Figmaa.png" unoptimized priority/>

              <Image className= {styles.wix} alt="About us image" width={0} height={0} src="/wix.png" unoptimized priority/>

              <Image className= {styles.framer} alt="About us image" width={0} height={0} src="/Framer.png" unoptimized priority/>

              <Image className= {styles.webflow} alt="About us image" width={0} height={0} src="/webfloww.png" unoptimized priority/>

              <Image className= {styles.react} alt="About us image" width={0} height={0} src="/react.png" unoptimized priority/>

            </div>
        </section>

    </>



  );
}