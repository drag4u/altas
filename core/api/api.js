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
		this.typeController = require('./controllers/typeController')(logger, database, this.utils );
		this.fileController = require('./controllers/fileController')(logger, database, this.utils );
		this.matrixController = require('./controllers/matrixController')(logger, database, this.utils );
		this.schemaController = require('./controllers/schemaController')(logger, database, this.utils );
		this.InitializeEndpoints();
		this.app.listen(port, () => this.logger.info('Server has started on port: ' + port));
	}

	InitializeEndpoints(){
		this.app.get('/type/all', this.typeController.getAllTypes);
		this.app.post('/type/create', upload.single('cocFile'), this.typeController.createType);
		this.app.post('/type/edit/:id', upload.single('editCocFile'), this.typeController.editType);
		this.app.get('/type/:id', this.typeController.fetchType);
		this.app.post('/type/update', this.typeController.updateType);
		this.app.delete('/type/:id', this.typeController.deleteType);
		this.app.post('/type/removeColumn/:typeId/:versionVariant/:columnId', this.typeController.removeColumn);
		this.app.post('/type/addColumn/:typeId/:versionVariant/:columnId', this.typeController.addColumn);
		this.app.post('/type/removeRow/:typeId/:versionVariant/:rowId', this.typeController.removeRow);
		this.app.post('/type/addRow/:typeId/:versionVariant/:rowId', this.typeController.addRow);

		this.app.get('/files/:filename', this.fileController.getFile);

		this.app.get('/matrix/all/:id', this.matrixController.getAllMatrices);
		this.app.get('/matrix/:id', this.matrixController.getMatrix);
		this.app.post('/matrix/create/:id', this.matrixController.createMatrix);
		this.app.delete('/matrix/:id', this.matrixController.deleteMatrix);
		this.app.post('/matrix/edit/:id', this.matrixController.editMatrix);
		this.app.post('/matrix/copy/:typeId/:matrixId', this.matrixController.copyMatrix);

		this.app.get('/schema/:typeId', this.schemaController.getSchema);
		this.app.get('/schema/data/:valueId', this.schemaController.getSchemaData);
		this.app.post('/schema/create/:valueId', this.schemaController.createSchemaData);
		this.app.post('/schema/edit/:dataId', this.schemaController.editSchemaData);
		this.app.post('/schema/necessity/:dataId', this.schemaController.editSchemaNecessity);
		this.app.delete('/schema/delete/:dataId', this.schemaController.deleteSchemaData);
		this.app.delete('/schema/delete/:dataId', this.schemaController.deleteSchemaData);
	}
}

module.exports = {
	API
};