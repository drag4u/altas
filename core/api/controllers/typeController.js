const path = require('path');
const multer = require('multer');

const getAllTypes = require('./type/getAllTypes');
const createType = require('./type/createType');
const editType = require('./type/editType');
const copyType = require('./type/copyType');
const removeCoCFile = require('./type/removeCoCFile');
const removeCNITFile = require('./type/removeCNITFile');
const fetchType = require('./type/fetchType');
const deleteType = require('./type/deleteType');
const removeColumn = require('./type/removeColumn');
const addColumn = require('./type/addColumn');
const removeRow = require('./type/removeRow');
const addRow = require('./type/addRow');

class TypeController {
	
	CREATE_FIELD_FILE_SETTINGS = [{ name: 'cocFile', maxCount: 1 }, { name: 'cnitFile', maxCount: 1 }]
	EDIT_FIELD_FILE_SETTINGS = [{ name: 'editCocFile', maxCount: 1 }, { name: 'editCNITFile', maxCount: 1 }]
	storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, './data/files/')
		},
		filename: function (req, file, cb) {
			const fileExt = path.extname(file.originalname);
			const baseName = path.basename(file.originalname, fileExt);
			const randomSegment = Math.random().toString(36).substring(2, 7);
			const newFilename = `${baseName}-${randomSegment}${fileExt}`;
			cb(null, newFilename);
		}
	});

	constructor(utils, app) {
		this.utils = utils;
		this.app = app;
		this.upload = multer({ storage: this.storage });
		this.InitializeEndpoints();
	}

	InitializeEndpoints() {
		// CREATE
		this.app.post('/type/create', this.upload.fields(this.CREATE_FIELD_FILE_SETTINGS), async (req, res) => await createType(req, res, this.utils));
		this.app.post('/type/addColumn/:typeId/:versionVariant/:columnId', async (req, res) => await addColumn(req, res, this.utils));
		this.app.post('/type/addRow/:typeId/:versionVariant/:rowId', async (req, res) => await addRow(req, res, this.utils));
		this.app.post('/type/copy/:id', async (req, res) => await copyType(req, res, this.utils));
		// READ
		this.app.get('/type/all', async (req, res) => await getAllTypes(req, res, this.utils));
		this.app.get('/type/:id', async (req, res) => await fetchType(req, res, this.utils));
		// UPDATE
		this.app.post('/type/edit/:id', this.upload.fields(this.EDIT_FIELD_FILE_SETTINGS), async (req, res) => await editType(req, res, this.utils));
		// DELETE
		this.app.delete('/type/:id', async (req, res) => await deleteType(req, res, this.utils));
		this.app.post('/type/removeCoC/:id', async (req, res) => await removeCoCFile(req, res, this.utils));
		this.app.post('/type/removeCNIT/:id', async (req, res) => await removeCNITFile(req, res, this.utils));
		this.app.post('/type/removeColumn/:typeId/:versionVariant/:columnId', async (req, res) => await removeColumn(req, res, this.utils));
		this.app.post('/type/removeRow/:typeId/:versionVariant/:rowId', async (req, res) => await removeRow(req, res, this.utils));
	}
}
module.exports = TypeController;