/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        roboto: ['var(--font-roboto)', 'sans-serif'],
      },
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        success: 'var(--success)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        'border-color': 'var(--border-color)',
        'card-bg': 'var(--card-bg)',
        'sidebar-bg': 'var(--sidebar-bg)',
        'header-bg': 'var(--header-bg)',
        'nitro-color': 'var(--nitro-color)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
