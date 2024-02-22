const getAllTypes = require('./type/getAllTypes');
const createType = require('./type/createType');
const editType = require('./type/editType');
const copyType = require('./type/copyType');
const removeCoCFile = require('./type/removeCoCFile');
const removeCNITFile = require('./type/removeCNITFile');
const fetchType = require('./type/fetchType');
const updateType = require('./type/updateType');
const deleteType = require('./type/deleteType');
const removeColumn = require('./type/removeColumn');
const addColumn = require('./type/addColumn');
const removeRow = require('./type/removeRow');
const addRow = require('./type/addRow');

class TypeController {
	
	constructor(utils) {
		this.utils = utils;
	}

	async getAllTypes(req, res) {
		await getAllTypes(req, res, this.utils);
	}

	async createType(req, res) {
		await createType(req, res, this.utils);
	}

	async editType(req, res) {
		await editType(req, res, this.utils);
	}

	async copyType(req, res) {
		await copyType(req, res, this.utils);
	}

	async removeCoCFile(req, res) {
		await removeCoCFile(req, res, this.utils);
	}

	async removeCNITFile(req, res) {
		await removeCNITFile(req, res, this.utils);
	}

	async fetchType(req, res) {
		await fetchType(req, res, this.utils);
	}

	async updateType(req, res) {
		await updateType(req, res, this.utils);
	}

	async deleteType(req, res) {
		await deleteType(req, res, this.utils);
	}

	async removeColumn(req, res) {
		await removeColumn(req, res, this.utils);
	}

	async addColumn(req, res) {
		await addColumn(req, res, this.utils);
	}

	async removeRow(req, res) {
		await removeRow(req, res, this.utils);
	}

	async addRow(req, res) {
		await addRow(req, res, this.utils);
	}
}
module.exports = TypeController;