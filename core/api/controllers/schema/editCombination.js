module.exports = async function (req, res, utils) {
	const combinationId = req.params.combinationId;
	const { name, combinationValues } = req.body;
	// delete existing sequence
	let query = `DELETE FROM schema_combination_sequence WHERE schema_combination_id = ${utils.Esc(combinationId)}`;
	utils.ExecuteAction(res, query, () => {
		// insert new sequence
		let query = `INSERT INTO schema_combination_sequence (schema_combination_id, schema_value_id) VALUES `;
		for (let i = 0; i < combinationValues.length; i++) {
			const dataRow = combinationValues[i];
			query += `(${utils.Esc(combinationId)}, ${utils.Esc(dataRow)}),`;
		}
		query = query.slice(0, -1);
		query += `;`;
		utils.ExecuteAction(res, query, () => {
			// update combination name
			let query = `UPDATE schema_combination SET combination_name = '${utils.Esc(name)}' WHERE schema_combination_id = ${utils.Esc(combinationId)}`;
			utils.ExecuteAction(res, query, () => {
				res.status(200).json({info: 'Combination successfully updated'});
			});
		});
	});
}