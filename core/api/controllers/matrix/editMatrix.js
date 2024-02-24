module.exports = async function (req, res, utils) {
	const {id} = req.params;
	const {tableInfo} = req.body;
	utils.ExecuteAction(res, `DELETE FROM matrix_value WHERE matrix_id = ${utils.Esc(id)}`, () => {
		let query = `INSERT INTO matrix_value (matrix_id, version_variant, row, column, value) VALUES `;
		for (let i = 0; i < tableInfo.length; i++) {
			const dataRow = tableInfo[i];
			query += `(${utils.Esc(id)}, ${utils.Esc(dataRow.version_variant)}, ${utils.Esc(dataRow.row)}, ${utils.Esc(dataRow.col)}, "${utils.Esc(dataRow.value)}"),`;
		}
		query = query.slice(0, -1);
		query += `;`;
		utils.ExecuteAction(res, query, () => {
			utils.ExecuteAction(res, `SELECT type_id FROM matrix where matrix_id = ${utils.Esc(id)}`, rows => {
				const typeId = rows[0].type_id;
				utils.UpdateTypeSchema(res, typeId, () => {
					res.status(200).json({info: 'Matrix successfully updated'});
				});
			});
		});
	});
}