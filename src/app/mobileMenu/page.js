import MobileMenuCard from "../components/mobileMenu";
import menuStyles from '../styles_css/menuPage.module.css';
import NavBar from '../components/navBar';


const mobileMenuPage = () => {
    return (
        <>
            <NavBar/>

            <div className= {menuStyles.buttons}>
                <MobileMenuCard
                    title= "Home"
                    icon = "/home.svg"
                    arrowIcon= "/arrow.svg"
                />

                <MobileMenuCard
                    title= "About us"
                    icon = "/about us.svg"
                    arrowIcon= "/arrow.svg"
                />

                <MobileMenuCard
                    title= "Our services"
                    icon = "/our services.svg"
                    arrowIcon= "/arrow.svg"
                />

                <MobileMenuCard
                    title= "Contact us"
                    icon = "/contact us.svg"
                    arrowIcon= "/arrow.svg"
                />
                <div className= {menuStyles.logoContainer}>
                    <img className= {menuStyles.logo} src ="/li-icon.svg"/>
                    <img className= {menuStyles.logo} src ="/fb-icon.svg"/>
                    <img className= {menuStyles.logo} src ="/ig-icon.svg"/>
                </div>

                <img className= {menuStyles.image} src ="/menuPicture.png"/>

            </div>
        </>


    );
}

export default mobileMenuPage;


