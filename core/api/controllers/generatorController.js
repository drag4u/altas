const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const XlsxTemplate = require('xlsx-template');

module.exports = (logger, database, utils) => {
    return {
        GenerateCoC: async (req, res) => {
            const { typeId } = req.params;
            utils.ExecuteAction(res, `SELECT coc_file FROM type where type_id = ${typeId}`, async rows => {
                const cocFile = rows[0].coc_file;
                const filePath = path.join('./data/files', cocFile);

                // Determine file type
                const isWordFile = cocFile.endsWith('.docx');
                const isExcelFile = cocFile.endsWith('.xlsx');

                try {
                    const content = fs.readFileSync(filePath, 'binary');

                    if (isWordFile) {
                        await processWordFile(content, cocFile, req, res);
                    } else if (isExcelFile) {
                        await processExcelFile(content, cocFile, req, res);
                    } else {
                        res.status(400).send('Unsupported file type');
                    }
                } catch (error) {
                    res.status(500).json({ error: error.message });
                }
            });
        }
    };
};

async function processWordFile(content, cocFile, req, res) {
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, getDocxOptions());
    const placeHolderData = getPlaceholderData(req);

    doc.setData(placeHolderData);

    try {
        doc.render();
    } catch (error) {
        res.status(200).json({ error: error });
        return;
    }

    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    const filename = saveFile(buf, cocFile, 'docx');
    res.status(200).json({ fileName: filename });
}

async function processExcelFile(content, cocFile, req, res) {
    const template = new XlsxTemplate(content);
    const values = getPlaceholderData(req);

    // Attempt to substitute placeholders in each sheet until an error occurs
    let sheetNumber = 1;
    try {
        while (true) {
            template.substitute(sheetNumber, values);
            sheetNumber++;
        }
    } catch (error) {
        // Assuming error is thrown when no more sheets are available
        console.log(`Processed ${sheetNumber - 1} sheets.`, error.message);
    }

    // Generate the final Excel file
    const data = template.generate({ type: 'nodebuffer' });
    const filename = saveFile(data, cocFile, 'xlsx');
    res.status(200).json({ fileName: filename });
}

function getDocxOptions() {
    return {
        // Docxtemplater options
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
            start: '${',
            end: '}'
        }
    };
}

function getPlaceholderData(req) {
    let placeHolderData = {};
    req.body.placeholderData.forEach(c => {
        placeHolderData[c.placeholder] = c.data;
    });
    return placeHolderData;
}

function saveFile(data, originalFileName, extension) {
    const hash = generateRandomString(5);
    const filename = `${originalFileName.slice(0, -5)}-${hash}.${extension}`;
    fs.writeFileSync(path.join('./data/files', filename), data);
    return filename;
}

function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}