import Link from 'next/link';
import navStyles from '../styles_css/navigationbar.module.css';

const NavBar = () => {
  return (
    <nav className={navStyles.navbar}>

      <div className = {navStyles.logo}>Pinnacle Studios.</div>

      <ul className={navStyles['nav-links']}>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/about">About us</Link></li>
        <li><Link href="/services">Services</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>

    <button type="Contact" className={navStyles.button}></button>

    </nav>
  );
}

export default NavBar;