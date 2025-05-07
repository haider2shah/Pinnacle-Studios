import SectionOne from '../components/auSection1';
import SectionTwo from '../components/auSection2';
import ImageCard from '../components/auImageCard';

import NavBar from '../components/navBar';
import auStyles from '../styles_css/auPage.module.css';

export default function AboutUs() {
    return (
      <>
        <NavBar/>

        <section>
          <SectionOne/>
        </section>

        <section>
          <SectionTwo/>
        </section>

        <section className= {auStyles.Section3}>
          <div className= {auStyles.heading}>
              <h1 className= {auStyles.heading1}>The minds behind</h1>
              <h1 className= {auStyles.heading2}> Pinnacle Studios.</h1>
          </div>

          <div className= {auStyles.team}>
                <ImageCard
                    name = "Haider Shah"
                    src = "/haider.png"
                    position = "Founder & Lead UX Designer"
                />

                <ImageCard
                    name = "Syed Zain Ali"
                    src = "/zain.png"
                    position = "Front - End Developer"
                />

                <ImageCard
                    name = "Ali Raza"
                    src = "/raza.png"
                    position = "Full - Stack Developer"
                />  
          </div>

        </section>


      </>
      
    );
  }
  