module.exports = async function (req, res, utils) {
	const typeId = req.params.id;
	const {tableInfo} = req.body;
	utils.ExecuteAction(res, `INSERT INTO matrix (type_id) VALUES (${utils.Esc(typeId)})`, () => {
		utils.ExecuteAction(res, `SELECT MAX(matrix_id) as "id" FROM matrix`, rows => {
			const matrixId = rows[0].id;
			let query = `INSERT INTO matrix_value (matrix_id, version_variant, row, column, value) VALUES `;
			for (let i = 0; i < tableInfo.length; i++) {
				const dataRow = tableInfo[i];
				query += `(${utils.Esc(matrixId)}, ${utils.Esc(dataRow.version_variant)}, ${utils.Esc(dataRow.row)}, ${utils.Esc(dataRow.col)}, "${utils.Esc(dataRow.value)}"),`;
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
}