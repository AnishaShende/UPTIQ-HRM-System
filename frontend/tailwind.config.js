/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				purple: {
  					light: '#E8DCFF',
  					medium: '#C4A9FF',
  					dark: '#8B5FBF'
  				},
  				green: {
  					light: '#D4F4DD',
  					medium: '#A8E6C1',
  					dark: '#4CAF50'
  				},
  				orange: {
  					light: '#FFE4D6',
  					medium: '#FFB08A',
  					dark: '#FF7043'
  				},
  				blue: {
  					light: '#E3F2FD',
  					medium: '#90CAF9',
  					dark: '#2196F3'
  				},
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			neutral: {
  				white: '#FFFFFF',
  				background: '#F8F9FA',
  				cardBackground: '#FFFFFF',
  				border: '#E9ECEF',
  				shadow: 'rgba(0, 0, 0, 0.08)'
  			},
  			text: {
  				primary: '#2C3E50',
  				secondary: '#7F8C8D',
  				muted: '#BDC3C7'
  			},
  			accent: {
  				success: '#27AE60',
  				warning: '#F39C12',
  				error: '#E74C3C',
  				info: '#3498DB',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'sans-serif'
  			]
  		},
  		width: {
  			sidebar: '240px',
  			'sidebar-collapsed': '64px'
  		},
  		height: {
  			header: '64px'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
