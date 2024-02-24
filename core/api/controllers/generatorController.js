const GenerateCoC = require('./generator/generateCoC');
const GenerateCNIT = require('./generator/generateCNIT');

class GeneratorController {

	constructor(utils, app) {
		this.utils = utils;
		this.app = app;
		this.InitializeEndpoints();
	}

	InitializeEndpoints() {
		this.app.post('/generateCoC/:typeId', async (req, res) => await GenerateCoC(req, res, this.utils));
		this.app.post('/generateCNIT/:typeId', async (req, res) => await GenerateCNIT(req, res, this.utils));
	}
}

module.exports = GeneratorController;