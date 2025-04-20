import cardStyles from '../styles_css/menuCard.module.css';

const MobileMenuCard = ({ title, icon, arrowIcon }) => {
    return (
        <div className= {cardStyles.cardWrapper}>
            <div className={cardStyles.menuCard}>
                {icon && <img className= {cardStyles.cardIcon} src={icon} alt="icon" />}
                <span className={cardStyles.cardTitle}>{title}</span>
                {arrowIcon && <img className= {cardStyles.cardArrow} src={arrowIcon} alt="arrow icon" />}
            </div>
        </div>
    );
};
export default MobileMenuCard;
