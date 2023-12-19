module.exports = (logger, database, utils) => {
    return {
        getAllMatrices: async (req, res) => {
			const {id} = req.params;
			
			utils.ExecuteAction(res, `SELECT * from matrix where type_id = ${id}`, rows => {
				if (rows.length == 0) {
					res.status(200).json(rows);
				} else {
					let query = `SELECT * FROM matrix_value WHERE matrix_id IN (`;
					rows.forEach(row => {
						query += `${row.matrix_id},`;
					});
					query = query.slice(0, -1);
					query += `);`;
					utils.ExecuteAction(res, query, rows => {
						res.status(200).json(rows);
					});
				}
			});
        },
		getMatrix: async (req, res) => {
			const {id} = req.params;
			utils.ExecuteAction(res, `SELECT * FROM matrix_value WHERE matrix_id = ${id};`, rows => {
				res.status(200).json(rows);
			});
        },
		createMatrix: async (req, res) => {
			const typeId = req.params.id;
			const {tableInfo} = req.body;
			utils.ExecuteAction(res, `INSERT INTO matrix (type_id) VALUES (${typeId})`, () => {
				utils.ExecuteAction(res, `SELECT MAX(matrix_id) as "id" FROM matrix`, rows => {
					const matrixId = rows[0].id;
					let query = `INSERT INTO matrix_value (matrix_id, version_variant, row, column, value) VALUES `;
					for (let i = 0; i < tableInfo.length; i++) {
						const dataRow = tableInfo[i];
						query += `(${matrixId}, ${dataRow.version_variant}, ${dataRow.row}, ${dataRow.col}, "${dataRow.value}"),`;
					}
					query = query.slice(0, -1);
					query += `;`;
					utils.ExecuteAction(res, query, () => {
						//update type schema
						utils.UpdateTypeSchema(res, typeId, () => {
							res.status(200).json({info: 'Matrix successfully created'});
						});
					});
				});
			});
        },
		copyMatrix: async (req, res) => {
			const {typeId, matrixId} = req.params;
			utils.ExecuteAction(res, `SELECT * FROM matrix_value WHERE matrix_id = ${matrixId}`, tableInfo => {
				utils.ExecuteAction(res, `INSERT INTO matrix (type_id) VALUES (${typeId})`, () => {
					utils.ExecuteAction(res, `SELECT MAX(matrix_id) as "id" FROM matrix`, rows => {
						const newMatrixID = rows[0].id;
						let query = `INSERT INTO matrix_value (matrix_id, version_variant, row, column, value) VALUES `;
						for (let i = 0; i < tableInfo.length; i++) {
							const dataRow = tableInfo[i];
							query += `(${newMatrixID}, ${dataRow.version_variant}, ${dataRow.row}, ${dataRow.column}, "${dataRow.value}"),`;
						}
						query = query.slice(0, -1);
						query += `;`;
						utils.ExecuteAction(res, query, () => {
							res.status(200).json({info: 'Matrix successfully copied'});
						});
					});
				});
			});
        },
		editMatrix: async (req, res) => {
			const {id} = req.params;
			const {tableInfo} = req.body;
			utils.ExecuteAction(res, `DELETE FROM matrix_value WHERE matrix_id = ${id}`, () => {
				let query = `INSERT INTO matrix_value (matrix_id, version_variant, row, column, value) VALUES `;
				for (let i = 0; i < tableInfo.length; i++) {
					const dataRow = tableInfo[i];
					query += `(${id}, ${dataRow.version_variant}, ${dataRow.row}, ${dataRow.col}, "${dataRow.value}"),`;
				}
				query = query.slice(0, -1);
				query += `;`;
				utils.ExecuteAction(res, query, () => {
					utils.ExecuteAction(res, `SELECT type_id FROM matrix where matrix_id = ${id}`, rows => {
						const typeId = rows[0].type_id;
						utils.UpdateTypeSchema(res, typeId, () => {
							res.status(200).json({info: 'Matrix successfully updated'});
						});
					});
				});
			});
        },
		deleteMatrix: async (req, res) => {
			const {id} = req.params;
			utils.ExecuteAction(res, `SELECT type_id FROM matrix where matrix_id = ${id}`, typeRows => {
				const typeId = typeRows[0].type_id;
				
				utils.ExecuteAction(res, `DELETE FROM matrix WHERE matrix_id = ${id}`, () => {
					utils.ExecuteAction(res, `DELETE FROM matrix_value WHERE matrix_id = ${id}`, () => {
						utils.UpdateTypeSchema(res, typeId, () => {
							res.status(200).json({info: 'Matrix successfully deleted'});
						});
					});
				});
			});
		}
    };
};