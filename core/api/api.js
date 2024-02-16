const { ApiUtils } = require('./apiUtils');

const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
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

const upload = multer({ storage: storage });

class API{
	constructor(port, logger, database){
		this.logger = logger;
		this.database = database;
		this.utils = new ApiUtils(logger, database);
		this.app = express();
		this.app.use(express.static('web'));
		this.app.use(express.json());
		this.app.set('views', path.join(process.cwd(), 'core/views'));
		this.app.set('view engine', 'ejs');

		this.app.get('/', function(req, res){
			res.render('index', {
				hello: 'Hello World',
				foo: 'bar'
			});
		});

		this.typeController = require('./controllers/typeController')(logger, database, this.utils );
		this.fileController = require('./controllers/fileController')(logger, database, this.utils );
		this.matrixController = require('./controllers/matrixController')(logger, database, this.utils );
		this.schemaController = require('./controllers/schemaController')(logger, database, this.utils );
		this.generatorController = require('./controllers/generatorController')(logger, database, this.utils );
		this.InitializeEndpoints();
		this.app.listen(port, () => this.logger.info('Server has started on port: ' + port));
	}

	InitializeEndpoints(){
		this.app.get('/type/all', this.typeController.getAllTypes);
		this.app.post('/type/create', upload.fields([{ name: 'cocFile', maxCount: 1 }, { name: 'cnitFile', maxCount: 1 }]), this.typeController.createType);
		this.app.post('/type/edit/:id', upload.fields([{ name: 'editCocFile', maxCount: 1 }, { name: 'editCNITFile', maxCount: 1 }]), this.typeController.editType);
		this.app.post('/type/copy/:id', this.typeController.copyType);
		this.app.post('/type/removeCoC/:id', this.typeController.removeCoCFile);
		this.app.post('/type/removeCNIT/:id', this.typeController.removeCNITFile);
		this.app.get('/type/:id', this.typeController.fetchType);
		this.app.post('/type/update', this.typeController.updateType);
		this.app.delete('/type/:id', this.typeController.deleteType);
		this.app.post('/type/removeColumn/:typeId/:versionVariant/:columnId', this.typeController.removeColumn);
		this.app.post('/type/addColumn/:typeId/:versionVariant/:columnId', this.typeController.addColumn);
		this.app.post('/type/removeRow/:typeId/:versionVariant/:rowId', this.typeController.removeRow);
		this.app.post('/type/addRow/:typeId/:versionVariant/:rowId', this.typeController.addRow);

		this.app.get('/files/:filename', this.fileController.getFile);
		this.app.get('/files/temporary/:filename', this.fileController.getTemporaryFile);

		this.app.get('/matrix/all/:id', this.matrixController.getAllMatrices);
		this.app.get('/matrix/:id', this.matrixController.getMatrix);
		this.app.post('/matrix/create/:id', this.matrixController.createMatrix);
		this.app.delete('/matrix/:id', this.matrixController.deleteMatrix);
		this.app.post('/matrix/edit/:id', this.matrixController.editMatrix);
		this.app.post('/matrix/copy/:typeId/:matrixId', this.matrixController.copyMatrix);

		this.app.get('/schema/:typeId', this.schemaController.getSchema);
		this.app.get('/schema/data/:valueId', this.schemaController.getSchemaData);
		this.app.post('/schema/create/:valueId', this.schemaController.createSchemaData);
		this.app.post('/schema/createCombination/:typeId', this.schemaController.createCombination);
		this.app.post('/schema/editCombination/:combinationId', this.schemaController.editCombination);
		this.app.post('/schema/copyCombination/:combinationId', this.schemaController.copyCombination);
		this.app.post('/schema/createCombinationData/:combinationId', this.schemaController.createCombinationData);
		this.app.post('/schema/copyCombinationData/:combinationDataId', this.schemaController.copyCombinationData);
		this.app.get('/schema/combinationData/:combinationDataId', this.schemaController.getCombinationData);
		this.app.post('/schema/combinationData/:combinationDataId', this.schemaController.editCombinationData);
		this.app.post('/schema/getCombinations/:typeId', this.schemaController.getCombinations);
		this.app.post('/schema/edit/:dataId', this.schemaController.editSchemaData);
		this.app.post('/schema/necessity/:dataId', this.schemaController.editSchemaNecessity);
		this.app.delete('/schema/delete/:dataId', this.schemaController.deleteSchemaData);
		this.app.delete('/schema/deleteCombinationData/:combinationDataId', this.schemaController.deleteCombinationData);
		this.app.delete('/schema/deleteCombination/:combinationId', this.schemaController.deleteCombination);
		this.app.post('/schema/createField/:typeId', this.schemaController.createField);
		this.app.get('/schema/fields/:fieldId', this.schemaController.getFields);
		this.app.get('/schema/field/:fieldId', this.schemaController.getField);
		this.app.post('/schema/field/:fieldId', this.schemaController.editField);
		this.app.delete('/schema/deleteField/:dataId', this.schemaController.deleteSchemaFieldData);

		this.app.post('/generateCoC/:typeId', this.generatorController.GenerateCoC);
		this.app.post('/generateCNIT/:typeId', this.generatorController.GenerateCNIT);
	}
}

module.exports = {
	API
};