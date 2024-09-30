module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  theme: {
    extend: {
      colors: {
        darkBackground: '#09090b',
        darkSecondary: '#17223B',
        darkText: '#ffffff',
        darkSecondaryText: '#FF6768',
        darkCard: '#263859',
        darkBtn:'#2e57a3',
        darkDanger: '#b91c1c',
        darkDangerContainer: '#fecdd3',
        darkBadge:'#7d50b5',
      }
    },
  },
  plugins: [],
};
