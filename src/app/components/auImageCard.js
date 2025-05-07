import Image from 'next/image';
import Styles from '../styles_css/auImageCard.module.css';

const ImageCard = ({name, position, src}) => {
    return (
        <div className= {Styles.wrapper}>
            <div className= {Styles.card}>
                <div className= {Styles.picture}>
                    <Image className= {Styles.image} alt="Team members" width={0} height={0} src= {src} unoptimized priority/>
                </div>
                <div className= {Styles.text}>
                    <div>
                        <p className= {Styles.name}>
                                {name}
                        </p>
                        <p className= {Styles.position}>
                                {position}
                        </p>
                </div>
                </div>
            </div>


        </div>




    );
};

export default ImageCard;