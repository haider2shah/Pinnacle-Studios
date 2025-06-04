import Styles from '../styles_css/serviceCard.module.css';
import Image from 'next/image';



const ServicesCard = ({ title, paragraph, image}) => {
    return (
        <div className= {Styles.wrapper}>
            <div className= {Styles.card}>
                    <div className= {Styles.textBox}>
                        <p className= {Styles.title}>
                                {title}
                        </p>
                        <p className= {Styles.paragraph}>
                                {paragraph}
                        </p>
                        <button className= {Styles.button}>Contact us</button>

                    </div>

                    <div className= {Styles.picture}>
                        <Image className= {Styles.image} alt="Team members" width={0} height={0} src= {image} unoptimized priority/>
                    </div>

                    <div>
                        <p>Haider Shah</p>
                    </div>
            </div>



        </div>




    );
};

export default ServicesCard;