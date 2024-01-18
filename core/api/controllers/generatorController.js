const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

module.exports = (logger, database, utils) => {
    return {
        GenerateCoC: async (req, res) => {
			const {typeId} = req.params;
			utils.ExecuteAction(res, `SELECT coc_file FROM type where type_id = ${typeId}`, rows => {
				const cocFile = rows[0].coc_file;
				
				const content = fs.readFileSync('./data/files/' + cocFile, 'binary');

				const zip = new PizZip(content);

				const customParser = function(tag) {
					return {
						get(scope) {
							if (scope[tag] === undefined) {
								// If the tag is undefined, return a dash
								return '-';
							}
							// Otherwise, return the actual value
							return scope[tag];
						}
					};
				};
				
				const options = {
					parser: customParser,
					paragraphLoop: true,
					linebreaks: true,
					delimiters: {
						start: '%%',
						end: '%%'
					}
				};

				const doc = new Docxtemplater(zip, options);

				let placeHolderData = {}
				req.body.placeholderData.forEach(c => {
					placeHolderData[`${c.placeholder}`] = c.data;
				});
				
				doc.setData(placeHolderData);

				try {
					// Render the document (replace all occurrences of placeholders by their values)
					doc.render()
				}
				catch (error) {
					// Catch rendering errors
					const e = {
						message: error.message,
						name: error.name,
						stack: error.stack,
						properties: error.properties,
					}
					
					res.status(200).json({error: e});
					return;
				}
				
				const buf = doc.getZip().generate({type: 'nodebuffer'});
				
				const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
				let hash = '';
				for (let i = 0; i < 5; i++) {
					hash += characters.charAt(Math.floor(Math.random() * characters.length));
				}

				// Write the new .docx file
				let filename = cocFile.slice(0, -11) + '-' + hash + '.docx';
				fs.writeFileSync('./data/files/' + cocFile.slice(0, -11) + '-' + hash + '.docx', buf);
				
				res.status(200).json({fileName: filename});
			});
        }
    };
};