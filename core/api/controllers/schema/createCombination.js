module.exports = async function (req, res, utils) {
	const typeId = req.params.typeId;
	const { name, combinationValues } = req.body;
	let query = `INSERT INTO schema_combination (type_id, combination_name) VALUES (${utils.Esc(typeId)}, '${utils.Esc(name)}')`;
	utils.ExecuteAction(res, query, () => {
		utils.ExecuteAction(res, `SELECT MAX(schema_combination_id) as "id" FROM schema_combination`, rows => {
			const newCombinationID = rows[0].id;
			let query = `INSERT INTO schema_combination_sequence (schema_combination_id, schema_value_id) VALUES `;
			for (let i = 0; i < combinationValues.length; i++) {
				const dataRow = combinationValues[i];
				query += `(${utils.Esc(newCombinationID)}, ${utils.Esc(dataRow)}),`;
			}
			query = query.slice(0, -1);
			query += `;`;
			utils.ExecuteAction(res, query, () => {
				res.status(200).json({info: 'Combination successfully created'});
			});
		});
	});
}