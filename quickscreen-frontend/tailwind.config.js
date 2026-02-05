/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#000000',
                surface: '#121212',
                surfaceHighlight: '#1A1A1A',
                primary: '#5682B1',
                secondary: '#739EC9',
                highlight: '#FFE8DB',
                border: '#333333',
            },

            boxShadow: {
                glow: '0 0 20px rgba(86, 130, 177, 0.15)',
                'glow-lg': '0 0 30px rgba(86, 130, 177, 0.3)',
                'glow-xl': '0 0 50px rgba(86, 130, 177, 0.5)',
            },

            borderRadius: {
                xl: '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },

            animation: {
                shine: 'shine 3s linear infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'blob': 'blob 7s infinite',
            },

            keyframes: {
                shine: {
                    '0%': { backgroundPosition: '200% center' },
                    '100%': { backgroundPosition: '-200% center' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
            },
        },
    },
    plugins: [],
};
