module.exports = {
	content: [
	'./src/**/*.ts'
	,'./public/**/*.{html,js}'
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Russo One','Black Han Sans', 'system-ui', 'sans-serif'],
			},
			keyframes: {
				'infinite-scroll': {
				'0%': { transform: 'translateX(0)' },
				'100%': { transform: 'translateX(-50%)' },
				},
		},
			animation: {
				'infinite-scroll': 'infinite-scroll 15s linear infinite',
			},
		},
	},
	plugins: [],
};
