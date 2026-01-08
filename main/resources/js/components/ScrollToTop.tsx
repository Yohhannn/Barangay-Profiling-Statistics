import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        // Threshold of 300px before showing
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <div
            className={`
                fixed bottom-8 right-8 z-[60] transition-all duration-500 ease-in-out transform
                ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'}
            `}
        >
            <button
                onClick={scrollToTop}
                className="
                    group relative
                    flex items-center justify-center
                    w-12 h-12
                    bg-blue-600 hover:bg-blue-700
                    text-white rounded-full shadow-2xl shadow-blue-200
                    transform hover:scale-110 hover:-translate-y-1
                    transition-all duration-300 ease-out
                    focus:outline-none focus:ring-4 focus:ring-blue-300
                "
                aria-label="Scroll to top"
            >
                {/* Subtle shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <ArrowUp className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:-translate-y-1" />
            </button>
        </div>
    );
}
