const getFile = require('./file/getFile');
const getTemporaryFile = require('./file/getTemporaryFile');

class FileController {
	
	constructor(utils, app) {
		this.utils = utils;
		this.app = app;
		this.InitializeEndpoints();
	}

	InitializeEndpoints() {
		this.app.get('/files/:filename', async (req, res) => await getFile(req, res, this.utils));
		this.app.get('/files/temporary/:filename', async (req, res) => await getTemporaryFile(req, res, this.utils));
	}
}
module.exports = FileController;