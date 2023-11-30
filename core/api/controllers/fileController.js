const path = require('path');
const fs = require('fs');

module.exports = (logger, database, utils) => {
    return {
        getFile: async (req, res) => {
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
    };
};