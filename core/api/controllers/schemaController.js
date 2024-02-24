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

	constructor(utils, app) {
		this.utils = utils;
		this.app = app;
		this.InitializeEndpoints();
	}

	InitializeEndpoints() {
		// CREATE
		this.app.post('/schema/create/:valueId', async (req, res) => await createSchemaData(req, res, this.utils));
		this.app.post('/schema/createField/:typeId', async (req, res) => await createField(req, res, this.utils));
		this.app.post('/schema/createCombination/:typeId', async (req, res) => await createCombination(req, res, this.utils));
		this.app.post('/schema/copyCombination/:combinationId', async (req, res) => await copyCombination(req, res, this.utils));
		this.app.post('/schema/createCombinationData/:combinationId', async (req, res) => await createCombinationData(req, res, this.utils));
		this.app.post('/schema/copyCombinationData/:combinationDataId', async (req, res) => await copyCombinationData(req, res, this.utils));
		// READ
		this.app.get('/schema/:typeId', async (req, res) => await getSchema(req, res, this.utils));
		this.app.get('/schema/data/:valueId', async (req, res) => await getSchemaData(req, res, this.utils));
		this.app.get('/schema/fields/:fieldId', async (req, res) => await getFields(req, res, this.utils));
		this.app.get('/schema/field/:fieldId', async (req, res) => await getField(req, res, this.utils));
		this.app.post('/schema/getCombinations/:typeId', async (req, res) => await getCombinations(req, res, this.utils));
		this.app.get('/schema/combinationData/:combinationDataId', async (req, res) => await getCombinationData(req, res, this.utils));
		// UPDATE
		this.app.post('/schema/field/:fieldId', async (req, res) => await editField(req, res, this.utils));
		this.app.post('/schema/necessity/:dataId', async (req, res) => await editSchemaNecessity(req, res, this.utils));
		this.app.post('/schema/edit/:dataId', async (req, res) => await editSchemaData(req, res, this.utils));
		this.app.post('/schema/editCombination/:combinationId', async (req, res) => await editCombination(req, res, this.utils));
		this.app.post('/schema/combinationData/:combinationDataId', async (req, res) => await editCombinationData(req, res, this.utils));
		// DELETE
		this.app.delete('/schema/delete/:dataId', async (req, res) => await deleteSchemaData(req, res, this.utils));
		this.app.delete('/schema/deleteField/:dataId', async (req, res) => await deleteSchemaFieldData(req, res, this.utils));
		this.app.delete('/schema/deleteCombination/:combinationId', async (req, res) => await deleteCombination(req, res, this.utils));
		this.app.delete('/schema/deleteCombinationData/:combinationDataId', async (req, res) => await deleteCombinationData(req, res, this.utils));
	}
}
module.exports = SchemaController;