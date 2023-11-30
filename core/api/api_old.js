const express = require('express');
const Database = require('./database');
const ExcelJS = require('exceljs');

class API{
	constructor(port){
		this.database = new Database('data.json');
		this.app = express();
		this.app.use(express.static('web'));
		this.app.use(express.json());
		this.InitalizeEndpoints();
		this.app.listen(port, () => console.log('Server has started on port: ' + port));
	}
	InitalizeEndpoints(){
		this.app.get('/info/:dynamic', (req, res) => {
			const {dynamic} = req.params;
			const {key} = req.query;
			console.log(dynamic, key);
			res.status(200).json({info: 'preset text'});
		})
		this.app.get('/list', (req, res) => {
			this.database.Read(data => {
				res.status(200).json({data});
			});
		})
		this.app.post('/createMatrix', (req, res) => {
			const {matrixJSON} = req.body;
			if (!matrixJSON)
				return res.status(400).send({status: 'failed'});
			this.database.Read(data => {
				data.list[Date.now()] = matrixJSON;
				this.database.Write(data, (err) => {
					if (err) console.log(err);
				})
			});
			res.status(200).send({status: 'success'});
		});
		this.app.post('/editMatrix', (req, res) => {
			const {matrixJSON} = req.body;
			if (!matrixJSON)
				return res.status(400).send({status: 'failed'});
			this.database.Read(data => {
				data.list[matrixJSON.matrixId] = matrixJSON;
				this.database.Write(data, (err) => {
					if (err) console.log(err);
				})
			});
			res.status(200).send({status: 'success'});
		});
		this.app.post('/deleteMatrix', (req, res) => {
			const {matrixId} = req.body;
			if (!matrixId)
				return res.status(400).send({status: 'failed'});
			this.database.Read(data => {
				delete data.list[matrixId];
				this.database.Write(data, (err) => {
					if (err) console.log(err);
				})
			});
			res.status(200).send({status: 'success'});
		});
		this.app.get('/template/:matrixId', (req, res) => {
            const { matrixId } = req.params;
            this.database.Read(data => {
                const matrixJSON = data.list[matrixId];

                if (!matrixJSON) {
                    return res.status(404).send({ status: 'not found' });
                }

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Matrix Data');

				const matrixColumnAmount = matrixJSON.variantMatrix[0].length + matrixJSON.versionMatrix[0].length;

				const firstRow = worksheet.addRow([]);
				firstRow.getCell(1).value = 'Matricos'
				firstRow.getCell(matrixColumnAmount + 1).value = 'Duomenys'
				worksheet.mergeCells(1, 1, 1, matrixColumnAmount);
				worksheet.mergeCells(1, matrixColumnAmount + 1, 1, 50);
				
				const secondRow = worksheet.addRow([]);
				secondRow.getCell(1).value = 'Variantai';
				secondRow.getCell(matrixJSON.variantMatrix[0].length + 1).value = 'Versijos';
				worksheet.mergeCells(2, 1, 2, matrixJSON.variantMatrix[0].length);
				worksheet.mergeCells(2, matrixJSON.variantMatrix[0].length + 1, 2, matrixColumnAmount);
				
				for (let columnIndex = 1; columnIndex <= matrixColumnAmount; columnIndex++) {
					worksheet.getColumn(columnIndex).width = 5;
				}

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=' + 'matrix.xlsx');

                workbook.xlsx.write(res)
                    .then(() => {
                        res.status(200).end();
                    })
                    .catch(error => {
                        console.error('Error generating Excel file:', error);
                        res.status(500).send({ status: 'error' });
                    });
            });
        });
	}
}

module.exports = {
	API
};