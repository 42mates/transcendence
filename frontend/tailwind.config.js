module.exports = {
	content: [
	'./src/**/*.ts'
	,'./public/**/*.{html,js}'
	],
	theme: {
		extend: {
			fontFamily: {
				customFont: ['"Bauhaus_93"', "sans-serif"],
				sans: ['Russo One','Black Han Sans',  'system-ui', 'sans-serif'],
			},
		},
	},
	plugins: [],
};
