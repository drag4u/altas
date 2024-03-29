const path = require('path');
const fs = require('fs');

module.exports = async function (req, res, utils) {
    utils.logger.info("Fetching a temporary file");
	const filename = req.params.filename;
	const fileDirectory = './data/files/temporary/';
	const filePath = path.join(fileDirectory, filename);

	if (fs.existsSync(filePath)) {
		res.sendFile(path.resolve(filePath), (err) => {
			if (!err) {
				// Attempt to delete the file after sending
				fs.unlink(filePath, (err) => {
				if (err) utils.logger.error("Error deleting file:", err);
				else utils.logger.info(`${filename} was deleted.`);
				});
			} else {
				// Log error if file sending failed
				utils.logger.error("Error sending file:", err);
			}
		});
	} else {
		res.status(404).send('File not found');
	}
}