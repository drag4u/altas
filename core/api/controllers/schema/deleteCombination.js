module.exports = async function (req, res, utils) {
	const combinationId = req.params.combinationId;
	let query = `DELETE FROM schema_combination WHERE schema_combination_id = ${utils.Esc(combinationId)}`;
	utils.ExecuteAction(res, query, () => {
		let query = `DELETE FROM schema_combination_sequence WHERE schema_combination_id = ${utils.Esc(combinationId)}`;
		utils.ExecuteAction(res, query, () => {
			let query = `DELETE FROM schema_combination_data WHERE schema_combination_id = ${utils.Esc(combinationId)}`;
			utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully deleted'}));
		});
	});
}