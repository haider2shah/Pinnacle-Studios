import Image from 'next/image';
import auStyles from '../styles_css/auSection1.module.css';


const SectionOne = () => {
    return (
        <div className= {auStyles.wrapper}>
            <div className= {auStyles.box}>
                <div>
                    <p className= {auStyles.text}>
                        We help startups put 
                        their best foot forward 
                        in the digital world. 
                    </p>
                </div>

                <div>
                    <Image className= {auStyles.imageOne} alt="About us image" width={0} height={0} src="/aboutOne.png" unoptimized priority/>
                </div>
            </div>


        </div>




    );
};

export default SectionOne;