module.exports = async function (req, res, utils) {
	const combinationDataId = req.params.combinationDataId;
	utils.ExecuteAction(res, `SELECT * from schema_combination_data where schema_combination_data_id = ${utils.Esc(combinationDataId)}`, rows => {
		const data = rows[0];
		let query = `INSERT INTO schema_combination_data (schema_combination_id, field_name, field_placeholder) VALUES (${utils.Esc(data.schema_combination_id)}, '${utils.Esc(data.field_name)}', '${utils.Esc(data.field_placeholder)}')`;
		utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
	})
}