import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const PageTransition = ({ children }) => {
    const container = useRef(null);
    const location = useLocation();

    useGSAP(() => {
        // "Sharp" Animation: Short duration, exponential ease (no bounce)
        gsap.from(container.current, {
            opacity: 0,
            y: 30,
            duration: 0.5,
            ease: "expo.out",
            clearProps: "all"
        });
    }, { scope: container, dependencies: [location.pathname] });

    return (
        <div ref={container} className="w-full h-full">
            {children}
        </div>
    );
};

export default PageTransition;
