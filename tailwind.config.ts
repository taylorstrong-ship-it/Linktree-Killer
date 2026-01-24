import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            keyframes: {
                'gradient-xy': {
                    '0%, 100%': {
                        backgroundSize: '400% 400%',
                        backgroundPosition: 'left center',
                    },
                    '50%': {
                        backgroundSize: '200% 200%',
                        backgroundPosition: 'right center',
                    },
                },
            },
            animation: {
                'mesh-gradient': 'gradient-xy 15s ease infinite',
            },
        },
    },
    plugins: [],
};
export default config;
