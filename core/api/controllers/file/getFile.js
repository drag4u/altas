const path = require('path');
const fs = require('fs');

module.exports = async function getAllTypes(req, res, utils) {
    logger.info("Fetching a file");
	const filename = req.params.filename;
	const fileDirectory = './data/files/';
	const filePath = path.join(fileDirectory, filename);

	if (fs.existsSync(filePath)) {
		res.sendFile(path.resolve(filePath));
	} else {
		res.status(404).send('File not found');
	}
}