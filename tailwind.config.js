/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                mistral: {
                    light: '#F5F5F0', // typical mistral website beige
                    dark: '#1C1917',
                    accent: '#FF7A00', // mistral orange/accent
                    brand: '#F9DFA' // matching brand aesthetic loosely 
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
