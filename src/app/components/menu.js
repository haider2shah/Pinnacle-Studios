'use client';

import { easeInOut, motion } from 'framer-motion';
import Link from 'next/link';
import MobileMenuCard from "../components/mobileMenu"; // Your existing card component
import menuStyles from '../styles_css/menuPage.module.css'; // Your existing CSS
import Image from 'next/image';

const MobileMenu = ({ onClose }) => {
    return (
        <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0, transition: { duration: 0.3, ease: [0.55, 0.75, 0.85, 0.85] } }}
            exit={{ x: '-100%', transition: { duration: 0.6, ease: [0.75, 0, 0.25, 1] } }}            
            className={menuStyles.menuWrapper} // You already have styles for this
        >
            <div className= {menuStyles.closeWrapper}>
                <div className={menuStyles.closeBox}>
                    <img onClick= {onClose} className={menuStyles.cencelIcon} src="/cancel-icon.svg" />
                    <h2 className={menuStyles.heading}>Menu</h2>
                </div>
            </div>

            <div className={menuStyles.buttons}>
                
                <Image className={menuStyles.image} alt="Menu image" width={1} height={1} src="/mobileMenuImage.png" unoptimized priority/>

                {/* Clickable Cards that Close the Menu */}
                <Link href="/" onClick={onClose}>
                    <MobileMenuCard title="Home" icon="/home.svg" arrowIcon="/arrow.svg" />
                </Link>

                <Link href="/about" onClick={onClose}>
                    <MobileMenuCard title="About us" icon="/about us.svg" arrowIcon="/arrow.svg" />
                </Link>

                <Link href="/services" onClick={onClose}>
                    <MobileMenuCard title="Our services" icon="/our services.svg" arrowIcon="/arrow.svg" />
                </Link>

                <Link href="/contact" onClick={onClose}>
                    <MobileMenuCard title="Contact us" icon="/contact us.svg" arrowIcon="/arrow.svg" />
                </Link>

                {/* Social Icons */}
                <div className={menuStyles.logoContainer}>
                    <img className={menuStyles.logo} src="/li-icon.svg" />
                    <img className={menuStyles.logo} src="/fb-icon.svg" />
                    <img className={menuStyles.logo} src="/ig-icon.svg" />
                </div>


            </div>
        </motion.div>
    );
};

export default MobileMenu;
