import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'inter': ['Inter', 'system-ui', 'sans-serif'],
				'sans': ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: '#e5e7eb',
				input: '#f3f4f6',
				ring: '#1d4ed8',
				background: '#f9fafb',
				foreground: '#111827',
				primary: {
					DEFAULT: '#1d4ed8',
					foreground: '#ffffff',
					hover: '#1e40af',
					50: '#eff6ff',
					100: '#dbeafe',
					500: '#1d4ed8',
					600: '#1e40af',
					700: '#1e3a8a'
				},
				secondary: {
					DEFAULT: '#f3f4f6',
					foreground: '#374151'
				},
				accent: {
					DEFAULT: '#10b981',
					foreground: '#ffffff',
					50: '#ecfdf5',
					100: '#d1fae5',
					500: '#10b981',
					600: '#059669'
				},
				error: {
					DEFAULT: '#ef4444',
					foreground: '#ffffff',
					50: '#fef2f2',
					100: '#fee2e2',
					500: '#ef4444',
					600: '#dc2626'
				},
				success: {
					DEFAULT: '#10b981',
					foreground: '#ffffff'
				},
				muted: {
					DEFAULT: '#f9fafb',
					foreground: '#6b7280'
				},
				card: {
					DEFAULT: '#ffffff',
					foreground: '#111827'
				},
				sidebar: {
					DEFAULT: '#ffffff',
					foreground: '#111827',
					primary: '#1d4ed8',
					'primary-foreground': '#ffffff',
					accent: '#f3f4f6',
					'accent-foreground': '#111827',
					border: '#e5e7eb',
					ring: '#1d4ed8'
				}
			},
			boxShadow: {
				'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
				'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'glow': '0 0 0 3px rgba(29, 78, 216, 0.1)',
				'glow-accent': '0 0 0 3px rgba(16, 185, 129, 0.1)'
			},
			borderRadius: {
				lg: '0.75rem',
				md: '0.5rem',
				sm: '0.375rem'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-right': {
					from: { transform: 'translateX(100%)' },
					to: { transform: 'translateX(0)' }
				},
				'slide-in-left': {
					from: { transform: 'translateX(-100%)' },
					to: { transform: 'translateX(0)' }
				},
				'scale-in': {
					from: { transform: 'scale(0.95)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'slide-up': {
					from: { transform: 'translateY(20px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					from: { transform: 'translateY(-20px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-down': 'slide-down 0.3s ease-out',
				'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
