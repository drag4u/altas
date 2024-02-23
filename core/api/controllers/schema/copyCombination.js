module.exports = async function (req, res, utils) {
	const combinationId = req.params.combinationId;
	utils.ExecuteAction(res, `SELECT * from schema_combination where schema_combination_id = ${utils.Esc(combinationId)}`, rows => {
		const combination = rows[0];
		let query = `INSERT INTO schema_combination (type_id, combination_name) VALUES (${utils.Esc(combination.type_id)}, '${utils.Esc(combination.combination_name)}')`;
		utils.ExecuteAction(res, query, () => {
			utils.ExecuteAction(res, `SELECT MAX(schema_combination_id) as "id" FROM schema_combination`, rows => {
				const newCombinationID = rows[0].id;
				utils.ExecuteAction(res, `SELECT * from schema_combination_sequence where schema_combination_id = ${utils.Esc(combinationId)}`, sequenceRows => {
					let query = `INSERT INTO schema_combination_sequence (schema_combination_id, schema_value_id) VALUES `;
					for (let i = 0; i < sequenceRows.length; i++) {
						const sequence = sequenceRows[i];
						query += `(${utils.Esc(newCombinationID)}, ${utils.Esc(sequence.schema_value_id)}),`;
					}
					query = query.slice(0, -1);
					query += `;`;
					utils.ExecuteAction(res, query, () => {
						// now copy schema_combination_data
						utils.ExecuteAction(res, `SELECT * from schema_combination_data where schema_combination_id = ${utils.Esc(combinationId)}`, dataRows => {
							let query = `INSERT INTO schema_combination_data (schema_combination_id, field_name, field_placeholder) VALUES `;
							for (let i = 0; i < dataRows.length; i++) {
								const data = dataRows[i];
								query += `(${utils.Esc(newCombinationID)}, '${utils.Esc(data.field_name)}', '${utils.Esc(data.field_placeholder)}'),`;
							}
							query = query.slice(0, -1);
							query += `;`;
							utils.ExecuteAction(res, query, () => {
								res.status(200).json({info: 'Combination successfully copied'});
							});
						});
					});
				});
			});
		});
	});
}