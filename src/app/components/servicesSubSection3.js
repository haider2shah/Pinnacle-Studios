import Styles from '../styles_css/subSection3.module.css';
import Image from 'next/image';

const Subsection3 = ({ title, text, cards = [] }) => {
  // Duplicate cards for seamless infinite loop
  const duplicatedCards = [...cards, ...cards];

  return (
    <div className={Styles.wrapper}>
      <div className={Styles.card}>
        <div className={Styles.textCombined}>
          <h1 className={Styles.title}>{title}</h1>
          <p className={Styles.para}>{text}</p>
        </div>

        <div className={Styles.scrollerWrapper}>
          <div className={Styles.scrollerContent}>
            {duplicatedCards.map((card, index) => (
              <div className={Styles.mainCard} key={index}>
                <Image
                  className={Styles.image}
                  alt={`Card ${index + 1}`}
                  width={0}
                  height={0}
                  src={card.image}
                  unoptimized
                  priority
                />
                <p className={Styles.text}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subsection3;
