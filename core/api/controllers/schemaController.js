const getSchema = require('./schema/getSchema');
const getSchemaData = require('./schema/getSchemaData');
const createSchemaData = require('./schema/createSchemaData');
const editSchemaData = require('./schema/editSchemaData');
const editSchemaNecessity = require('./schema/editSchemaNecessity');
const createField = require('./schema/createField');
const getFields = require('./schema/getFields');
const getField = require('./schema/getField');
const editField = require('./schema/editField');
const deleteSchemaData = require('./schema/deleteSchemaData');
const deleteSchemaFieldData = require('./schema/deleteSchemaFieldData');
const createCombination = require('./schema/createCombination');
const editCombination = require('./schema/editCombination');
const copyCombination = require('./schema/copyCombination');
const createCombinationData = require('./schema/createCombinationData');
const getCombinations = require('./schema/getCombinations');
const deleteCombinationData = require('./schema/deleteCombinationData');
const deleteCombination = require('./schema/deleteCombination');
const getCombinationData = require('./schema/getCombinationData');
const editCombinationData = require('./schema/editCombinationData');
const copyCombinationData = require('./schema/copyCombinationData');

class SchemaController {

	constructor(utils) {
		this.utils = utils;
	}

	async getSchema (req, res) {
		await getSchema(req, res, this.utils);
	}

	async getSchemaData (req, res) {
		await getSchemaData(req, res, this.utils);
	}

	async createSchemaData (req, res) {
		await createSchemaData(req, res, this.utils);
	}

	async editSchemaData (req, res) {
		await editSchemaData(req, res, this.utils);
	}
	
	async editSchemaNecessity (req, res) {
		await editSchemaNecessity(req, res, this.utils);
	}

	async createField (req, res) {
		await createField(req, res, this.utils);
	}

	async getFields (req, res) {
		await getFields(req, res, this.utils);
	}

	async getField (req, res) {
		await getField(req, res, this.utils);
	}

	async editField (req, res) {
		await editField(req, res, this.utils);
	}

	async deleteSchemaData (req, res) {
		await deleteSchemaData(req, res, this.utils);
	}

	async deleteSchemaFieldData (req, res) {
		await deleteSchemaFieldData(req, res, this.utils);
	}

	async createCombination (req, res) {
		await createCombination(req, res, this.utils);
	}

	async editCombination (req, res) {
		await editCombination(req, res, this.utils);
	}

	async copyCombination (req, res) {
		await copyCombination(req, res, this.utils);
	}

	async createCombinationData (req, res) {
		await createCombinationData(req, res, this.utils);
	}

	async getCombinations (req, res) {
		await getCombinations(req, res, this.utils);
	}

	async deleteCombinationData (req, res) {
		await deleteCombinationData(req, res, this.utils);
	}

	async deleteCombination (req, res) {
		await deleteCombination(req, res, this.utils);
	}

	async getCombinationData (req, res) {
		await getCombinationData(req, res, this.utils);
	}

	async editCombinationData (req, res) {
		await editCombinationData(req, res, this.utils);
	}

	async copyCombinationData (req, res) {
		await copyCombinationData(req, res, this.utils);
	}
}
module.exports = SchemaController;