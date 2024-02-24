const path = require('path');
const express = require('express');
const ApiUtils = require('./apiUtils');
const TypeController = require('./controllers/typeController')
const FileController = require('./controllers/fileController');
const SchemaController = require('./controllers/schemaController');
const MatrixController = require('./controllers/matrixController');
const GeneratorController = require('./controllers/generatorController');

class API{
	constructor(port, logger, database){
		this.utils = new ApiUtils(logger, database);

		this.app = express();

		new TypeController(this.utils, this.app);
		new FileController(this.utils, this.app);
		new MatrixController(this.utils, this.app);
		new SchemaController(this.utils, this.app);
		new GeneratorController(this.utils, this.app);
		
		this.app.use(express.static('web'));
		this.app.use(express.json());
		this.app.set('views', path.join(process.cwd(), 'core/views'));
		this.app.set('view engine', 'ejs');
		this.app.get('/', (req, res) => res.render('index'));
		this.app.listen(port, () => logger.info('Server has started on port: ' + port));
	}
}

module.exports = API;