'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles_css/LoadingOverlay.module.css';

// Path data lifted directly from white_logo.svg -- kept inline (rather than
// <img src="/white_logo.svg">) because animating stroke draw-on requires
// real <path> elements in the DOM, not an externally referenced image.
const LOGO_PATHS = [
  "M72.5534 349.161C66.5964 347.157 65.6063 344.717 68.5679 339.855C71.3381 335.308 74.0108 330.69 76.501 326C79.001 320.404 82.771 320.398 87.5615 320.404C134.049 320.467 180.536 320.426 227.023 320.41C237.353 320.407 247.684 320.432 258.014 320.357C263.828 320.315 265.012 318.229 262.017 313.377C258.083 307.005 253.858 300.805 250.126 294.319C247.399 289.58 243.695 287.73 238.287 287.753C204.797 287.894 171.306 287.865 137.815 287.841C122.293 287.831 111.465 274.996 115.697 261.281C116.892 257.407 119.447 253.91 121.614 250.385C130.589 235.785 139.687 221.261 148.671 206.666C152.834 199.904 159.056 197.047 166.701 197.011C183.696 196.932 200.694 196.831 217.686 197.059C224.515 197.151 229.1 194.845 232.817 188.792C246.745 166.11 261.141 143.714 275.399 121.235C279.374 114.969 279.188 110.383 275.168 104.161C261.448 82.9258 247.84 61.6179 234.237 40.3069C229.36 32.6663 222.83 32.4909 217.946 40.0311C205.192 59.7199 192.369 79.3652 179.81 99.1775C177.078 103.487 173.849 105.483 168.779 105.196C163.963 104.924 159.116 105.259 154.288 105.136C148.41 104.986 146.235 100.984 149.417 96.0722C159.456 80.5775 169.616 65.1616 179.676 49.6802C187.653 37.403 195.667 25.1469 203.456 12.7505C213.719 -3.58277 237.555 -4.5206 248.008 11.655C267.058 41.1345 285.736 70.86 304.195 100.714C309.248 108.886 309.267 118.065 304.043 126.356C284.888 156.753 265.473 186.988 246.182 217.3C242.373 223.284 236.614 225.271 229.959 225.302C212.797 225.382 195.632 225.56 178.475 225.289C171.684 225.182 167.152 227.649 163.841 233.536C160.175 240.052 155.88 246.209 151.991 252.603C148.932 257.632 150.005 259.504 155.948 259.515C185.772 259.571 215.598 259.74 245.42 259.491C254.951 259.412 262.1 262.504 267.183 270.75C277.221 287.035 287.76 303.014 297.619 319.405C305.801 333.009 296.033 349.179 279.899 349.19C213.751 349.237 147.602 349.212 81.4532 349.213C78.6222 349.213 75.7911 349.208 72.5534 349.161Z",
  "M76.6924 260.311C59.4631 287.829 42.4477 315.054 25.344 342.224C20.441 350.013 12.7712 351.941 5.76194 347.432C-0.543724 343.376 -1.86202 334.876 2.74192 327.544C40.5198 267.38 78.307 207.221 116.098 147.065C120.616 139.873 127.129 136.202 135.645 136.191C151.476 136.171 167.31 135.944 183.134 136.263C190.733 136.417 195.904 134.085 199.766 127.104C206.527 114.884 214.153 103.141 221.454 91.2217C224.666 85.9775 227.817 86.0049 231.032 91.269C233.722 95.675 236.246 100.187 239.044 104.523C241.524 108.365 241.284 111.951 238.911 115.698C230.545 128.91 222.158 142.11 213.935 155.412C209.949 161.859 204.253 164.638 196.851 164.626C180.022 164.598 163.192 164.722 146.363 164.639C139.977 164.607 135.244 166.985 131.805 172.489C113.556 201.697 95.1949 230.835 76.6924 260.311Z",
  "M432.899 305.655C437.842 313.588 442.656 321.175 447.349 328.836C451.147 335.037 449.017 344.259 443.083 347.855C436.803 351.661 428.547 349.914 424.616 343.604C389.35 286.993 354.174 230.325 318.878 173.732C316.068 169.228 315.823 165.196 318.776 160.786C321.087 157.335 323.091 153.681 325.297 150.158C328.852 144.479 332.447 144.57 336.059 150.391C342.374 160.569 348.658 170.767 355.002 180.928C380.897 222.405 406.81 263.871 432.899 305.655Z",
  "M280.949 226.53C281.474 223.788 281.659 221.204 282.779 219.123C285.058 214.886 287.786 210.885 290.431 206.854C293.535 202.126 297.399 202.267 300.455 207.172C316.017 232.152 331.575 257.136 347.12 282.127C358.268 300.048 369.398 317.981 380.523 335.916C381.311 337.187 382.112 338.472 382.708 339.837C384.802 344.633 382.526 348.764 377.347 349.044C372.035 349.33 366.612 349.67 361.401 348.894C358.481 348.459 354.826 346.475 353.311 344.056C329.31 305.728 305.601 267.217 281.838 228.741C281.491 228.181 281.298 227.526 280.949 226.53Z",
];

// Path index 2 (the outer diagonal bar) is the "gateway" -- instead of being
// drawn as a solid shape like the other three, its outline is used to punch a
// hole through the black backdrop, so the real page shows through it once it
// starts growing.
const GATEWAY_INDEX = 2;
const SOLID_INDICES = [0, 1, 3];
const GATEWAY_PATH = LOGO_PATHS[GATEWAY_INDEX];

// Oversized square, used as the mask's base layer (white = backdrop stays
// opaque) and as the black backdrop rect itself. 6000 units out from origin
// comfortably covers even very wide/4K viewports once scaled.
const BACKDROP_EXTENT = 6000;

// Center of path index 2, in the 450x350 viewBox's own coordinate space --
// measured via getBBox(), not eyeballed. Scaling the group with this as
// transform-origin makes that bar the thing the camera dives into, and the
// hole it leaves behind grow from the same fixed point.
const ZOOM_ORIGIN = "383px 248px";

const STAGGER = 0.08;
const DRAW_DURATION = 1.3;
const FILL_DELAY = 1.0; // fill begins slightly before the outline finishes, for a smooth handoff
const FILL_DURATION = 0.7;
const HOLD = 0.4;

const ZOOM_SCALE = 18;
const ZOOM_DURATION = 0.9;
const GATEWAY_FADE_DURATION = 0.3; // how fast the bar itself disappears, unmasking the hole
const POST_ZOOM_HOLD = 0.15;
const REVEAL_DURATION = 0.6; // final safety-net fade, in case the hole's geometry doesn't
// quite reach every corner on unusually wide viewports

const INTRO_END = (FILL_DELAY + FILL_DURATION + HOLD) * 1000;
const ZOOM_END = INTRO_END + ZOOM_DURATION * 1000;
const REVEAL_START = ZOOM_END + POST_ZOOM_HOLD * 1000;

export default function LoadingOverlay({ onComplete }) {
  const [phase, setPhase] = useState('intro'); // intro -> gateway -> reveal -> done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('gateway'), INTRO_END);
    const t2 = setTimeout(() => setPhase('reveal'), REVEAL_START);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === 'done') return null;

  const growing = phase === 'gateway' || phase === 'reveal';

  return (
    <motion.div
      className={styles.overlay}
      animate={{ opacity: phase === 'reveal' ? 0 : 1 }}
      transition={{ duration: REVEAL_DURATION, ease: 'easeInOut' }}
      onAnimationComplete={() => {
        if (phase === 'reveal') {
          setPhase('done');
          onComplete?.();
        }
      }}
    >
      <svg
        className={styles.logo}
        viewBox="0 0 450 350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="loadingGatewayMask" maskUnits="userSpaceOnUse" x={-BACKDROP_EXTENT} y={-BACKDROP_EXTENT} width={BACKDROP_EXTENT * 2} height={BACKDROP_EXTENT * 2}>
            {/* white = backdrop stays opaque; black = punches the hole */}
            <rect x={-BACKDROP_EXTENT} y={-BACKDROP_EXTENT} width={BACKDROP_EXTENT * 2} height={BACKDROP_EXTENT * 2} fill="white" />
            <path d={GATEWAY_PATH} fill="black" />
          </mask>
        </defs>

        {/* Scale + transform-origin live on this <g>, not the root <svg> --
            a <g> resolves transform-origin in the viewBox's own coordinate
            system, while the root <svg> element resolves it against its
            rendered CSS pixel box instead, which would pivot around the
            wrong point entirely. */}
        {/* Plain <g>, not <motion.g>: Framer Motion manages transform /
            transform-origin as its own internal motion values for SVG
            elements and silently resets transform-origin to "0px 0px"
            regardless of what's passed via style -- confirmed by inspecting
            the live DOM. A native CSS transition doesn't have that problem. */}
        <g
          style={{
            transformOrigin: ZOOM_ORIGIN,
            transform: growing ? `scale(${ZOOM_SCALE})` : 'scale(1)',
            transition: `transform ${ZOOM_DURATION}s cubic-bezier(0.6, 0.04, 0.98, 0.335)`,
          }}
        >
          {/* Black backdrop with the gateway hole. Everywhere except that
              hole stays opaque black; the hole grows with the group scale,
              revealing more of the real page underneath as it expands. */}
          <rect x={-BACKDROP_EXTENT} y={-BACKDROP_EXTENT} width={BACKDROP_EXTENT * 2} height={BACKDROP_EXTENT * 2} fill="black" mask="url(#loadingGatewayMask)" />

          {SOLID_INDICES.map((i) => (
            <motion.path
              key={i}
              d={LOGO_PATHS[i]}
              stroke="white"
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="white"
              initial={{ pathLength: 0, fillOpacity: 0 }}
              animate={{ pathLength: 1, fillOpacity: 1 }}
              transition={{
                pathLength: { duration: DRAW_DURATION, ease: 'easeInOut', delay: i * STAGGER },
                fillOpacity: { duration: FILL_DURATION, ease: 'easeInOut', delay: FILL_DELAY + i * STAGGER },
              }}
            />
          ))}

          {/* The gateway bar itself: drawn and filled white during the intro
              just like the others, then fades away once the hole starts
              growing, so nothing opaque is left sitting on top of it. */}
          <motion.path
            d={GATEWAY_PATH}
            stroke="white"
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="white"
            initial={{ pathLength: 0, fillOpacity: 0, opacity: 1 }}
            animate={{
              pathLength: 1,
              fillOpacity: 1,
              opacity: growing ? 0 : 1,
            }}
            transition={{
              pathLength: { duration: DRAW_DURATION, ease: 'easeInOut', delay: GATEWAY_INDEX * STAGGER },
              fillOpacity: { duration: FILL_DURATION, ease: 'easeInOut', delay: FILL_DELAY + GATEWAY_INDEX * STAGGER },
              opacity: { duration: GATEWAY_FADE_DURATION, ease: 'easeIn' },
            }}
          />
        </g>
      </svg>
    </motion.div>
  );
}
