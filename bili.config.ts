import { Config } from 'bili'

const config: Config = {
	banner: true,
	output: {
				//format: 'esm',
		fileName:'index.js',
		extractCSS: false
	},
	plugins: {
		vue: {
			css: false
		}
	}
}

export default config

/*
module.exports = {
	banner: true,
	output: {
		extractCSS: false
	},
	plugins: {
		vue: {
			css: true
		}
	},
	format: "esm",
	configOutput:{
		format:'esm'
	}
};*/