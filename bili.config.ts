import { Config } from 'bili'

const config: Config = {
	banner: true,
	output: {
		extractCSS: false
	},
	plugins: {
		vue: {
			css: true
		}
	},
	output: {
		//format: 'esm',
		fileName:'index.js',
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