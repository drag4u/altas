module.exports = async function (req, res, utils) {
	const combinationDataId = req.params.combinationDataId;
	utils.ExecuteAction(res, `SELECT * from schema_combination_data where schema_combination_data_id = ${utils.Esc(combinationDataId)}`, rows => {
		res.status(200).json(rows);
	});
}