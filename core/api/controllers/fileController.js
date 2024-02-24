const fs = require('fs');
const path = require('path');
const getFile = require('./file/getFile');
const getTemporaryFile = require('./file/getTemporaryFile');

class FileController {

	TEMPORARY_FILES = './data/files/temporary/';
	
	constructor(utils, app) {
		this.utils = utils;
		this.app = app;
		this.InitializeEndpoints();
		this.RemoveTemporaryFiles();
	}

	InitializeEndpoints() {
		this.app.get('/files/:filename', async (req, res) => await getFile(req, res, this.utils));
		this.app.get('/files/temporary/:filename', async (req, res) => await getTemporaryFile(req, res, this.utils));
	}

	RemoveTemporaryFiles()
	{
		const directory = this.TEMPORARY_FILES;
		fs.readdir(directory, (err, files) => {
			if (err) throw err;
			for (const file of files) {
				fs.unlink(path.join(directory, file), err => {
					if (err) throw err;
				});
			}
		});
	}
}
module.exports = FileController;