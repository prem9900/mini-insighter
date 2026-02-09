import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                heading: ['var(--font-outfit)', 'sans-serif'],
            },
            colors: {
                // Custom premium zinc scale if needed, though standard zinc is great
                // We'll trust the standard palette but define semantic aliases
                primary: '#09090b', // Zinc 950
                secondary: '#27272a', // Zinc 800
                muted: '#71717a', // Zinc 500
                border: '#e4e4e7', // Zinc 200
                input: '#e4e4e7', // Zinc 200
                ring: '#18181b', // Zinc 900
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            boxShadow: {
                'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
                'lift': '0 10px 30px rgba(0, 0, 0, 0.08)',
                'sharp': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
export default config
