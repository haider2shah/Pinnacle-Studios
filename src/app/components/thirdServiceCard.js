import Styles from '../styles_css/thirdServiceCard.module.css';
import Image from 'next/image';



const ThirdServicesCard = ({ title, paragraph, image,icon,iconTwo,iconThree,iconParagraphOne,iconParagraphTwo,iconParagraphThree, iconHeadingOne, iconHeadingTwo,iconHeadingThree}) => {
    return (
        <div className= {Styles.wrapper}>
            <div className= {Styles.card}>
                    <div className= {Styles.textBox}>
                        <p className={Styles.title}>
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

                    <div className= {Styles.iconWrapper}>
                        <div className= {Styles.iconCard}>
                            <div>
                                <Image className= {Styles.icon} alt="Team members" width={0} height={0} src= {icon} unoptimized priority/>
                            </div>
                            <div className= {Styles.iconText}>
                                <div className= {Styles.iconHeadingOne} >
                                    <p> {iconHeadingOne}</p>
                                </div>
                                <div className= {Styles.iconParaOne} >
                                    <p> {iconParagraphOne}</p>
                                </div>
                            </div>
                        </div>

                        <div className= {Styles.iconCard}>
                            <div>
                                <Image className= {Styles.icon} alt="Team members" width={0} height={0} src= {iconTwo} unoptimized priority/>
                            </div>
                            <div className= {Styles.iconText}>
                                <div className= {Styles.iconHeadingTwo} >
                                    <p> {iconHeadingTwo}</p>
                                </div>
                                <div className= {Styles.iconParaTwo} >
                                    <p> {iconParagraphTwo}</p>
                                </div>
                            </div>
                        </div>

                        <div className= {Styles.iconCard}>
                            <div>
                                <Image className= {Styles.icon} alt="Team members" width={0} height={0} src= {iconThree} unoptimized priority/>
                            </div>
                            <div className= {Styles.iconText}>
                                <div className= {Styles.iconHeadingThree} >
                                    <p> {iconHeadingThree}</p>
                                </div>
                                <div className= {Styles.iconParaThree} >
                                    <p> {iconParagraphThree}</p>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>



        </div>




    );
};

export default ThirdServicesCard;