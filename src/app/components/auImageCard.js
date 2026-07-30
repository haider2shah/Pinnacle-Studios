'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Styles from '../styles_css/auImageCard.module.css';

const cardItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const ImageCard = ({name, position, src}) => {
    return (
        <motion.div className= {Styles.wrapper} variants={cardItemVariants}>
            <div className= {Styles.card}>
                <div className= {Styles.picture}>
                    <Image className= {Styles.image} alt={`${name}, ${position} at Pinnacle Studios`} width={0} height={0} src= {src} unoptimized/>
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


        </motion.div>




    );
};

export default ImageCard;
