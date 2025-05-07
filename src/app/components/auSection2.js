import Image from 'next/image';
import auStyles from '../styles_css/auSection2.module.css';


const SectionTwo = () => {
    return (
        <div className= {auStyles.wrapper}>
            <div className= {auStyles.box}>
                <div>
                    <p className= {auStyles.text}>
                        At Pinnacle Studios, we turn your ideas into seamless <br/>
                        digital experiences. Based in the San Francisco Bay Area, <br/>
                        we design engaging websites and build custom software, <br/>
                        so you can focus on growing your business while we <br/>
                        handle the tech. 
                    </p>
                </div>

                <div>
                    <Image className= {auStyles.imageTwo} alt="About us image" width={0} height={0} src="/ipad.png" unoptimized priority/>
                </div>
            </div>
        </div>




    );
};

export default SectionTwo;