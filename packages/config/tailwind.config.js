/**
 * Shared Tailwind Configuration
 * Taylored Solutions Design System
 * 
 * Color Palette: Blue + Green (NO PURPLE)
 * Typography: Inter font family
 * Spacing: 8-point grid system
 */

module.exports = {
    theme: {
        extend: {
            colors: {
                brand: {
                    // Primary: Blue spectrum
                    primary: {
                        50: '#EFF6FF',
                        100: '#DBEAFE',
                        200: '#BFDBFE',
                        300: '#93C5FD',
                        400: '#60A5FA',
                        500: '#3B82F6',  // Main primary
                        600: '#2563EB',
                        700: '#1D4ED8',
                        800: '#1E40AF',
                        900: '#1E3A8A',
                    },
                    // Secondary: Green spectrum
                    secondary: {
                        50: '#F0FDF4',
                        100: '#DCFCE7',
                        200: '#BBF7D0',
                        300: '#86EFAC',
                        400: '#4ADE80',
                        500: '#10B981',  // Main secondary
                        600: '#059669',
                        700: '#047857',
                        800: '#065F46',
                        900: '#064E3B',
                    },
                    // Accent: Amber spectrum
                    accent: {
                        50: '#FFFBEB',
                        100: '#FEF3C7',
                        200: '#FDE68A',
                        300: '#FCD34D',
                        400: '#FBBF24',
                        500: '#F59E0B',  // Main accent
                        600: '#D97706',
                        700: '#B45309',
                        800: '#92400E',
                        900: '#78350F',
                    },
                    // Neutrals
                    dark: '#1F2937',
                    light: '#F3F4F6',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
            },
            spacing: {
                // 8-point grid extensions (in addition to Tailwind defaults)
                '18': '4.5rem',  // 72px
                '88': '22rem',   // 352px
                '128': '32rem',  // 512px
            },
            borderRadius: {
                '4xl': '2rem',
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.08)',
                'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.25)',
            },
            transitionDuration: {
                '400': '400ms',
            },
        },
    },
    plugins: [],
}
