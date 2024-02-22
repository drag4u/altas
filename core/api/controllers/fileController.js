const getFile = require('./file/getFile');
const getTemporaryFile = require('./file/getTemporaryFile');

class FileController {
	
	constructor(utils) {
		this.utils = utils;
	}

	async getFile(req, res) {
		await getFile(req, res, this.utils);
	}

	async getTemporaryFile (req, res) {
		await getTemporaryFile(req, res, this.utils);
	}
}
module.exports = FileController;