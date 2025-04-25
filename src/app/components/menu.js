'use client';

import { easeInOut, motion } from 'framer-motion';
import Link from 'next/link';
import MobileMenuCard from "../components/mobileMenu"; // Your existing card component
import menuStyles from '../styles_css/menuPage.module.css'; // Your existing CSS

const MobileMenu = ({ onClose }) => {
    return (
        <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0, transition: { duration: 0.3, ease: [0.55, 0.75, 0.85, 0.85] } }}
            exit={{ x: '-100%', transition: { duration: 0.6, ease: [0.75, 0, 0.25, 1] } }}            
            className={menuStyles.menuWrapper} // You already have styles for this
        >
            <div className={menuStyles.buttons}>

                {/* Close Button */}
                <button onClick={onClose} className={menuStyles.closeButton}>Close</button>

                <h2 className={menuStyles.heading}>MENU</h2>

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

                <img className={menuStyles.image} src="/menuImage.svg" />

            </div>
        </motion.div>
    );
};

export default MobileMenu;
