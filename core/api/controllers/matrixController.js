const getAllMatrices = require('./matrix/getAllMatrices');
const getMatrix = require('./matrix/getMatrix');
const createMatrix = require('./matrix/createMatrix');
const copyMatrix = require('./matrix/copyMatrix');
const editMatrix = require('./matrix/editMatrix');
const deleteMatrix = require('./matrix/deleteMatrix');

class MatrixController {

	constructor(utils, app) {
		this.utils = utils;
		this.app = app;
		this.InitializeEndpoints();
	}

	InitializeEndpoints() {
		// CREATE
		this.app.post('/matrix/create/:id', async (req, res) => await createMatrix(req, res, this.utils));
		this.app.post('/matrix/copy/:typeId/:matrixId', async (req, res) => await copyMatrix(req, res, this.utils));
		// READ
		this.app.get('/matrix/all/:id', async (req, res) => await getAllMatrices(req, res, this.utils));
		this.app.get('/matrix/:id', async (req, res) => await getMatrix(req, res, this.utils));
		// UPDATE
		this.app.post('/matrix/edit/:id', async (req, res) => await editMatrix(req, res, this.utils));
		// DELETE
		this.app.delete('/matrix/:id', async (req, res) => await deleteMatrix(req, res, this.utils));
	}
}

module.exports = MatrixController;