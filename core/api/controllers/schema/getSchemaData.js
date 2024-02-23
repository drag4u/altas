module.exports = async function (req, res, utils) {
	const valueId = req.params.valueId;
		
	utils.ExecuteAction(res, `SELECT * from schema_data where schema_value_id = ${utils.Esc(valueId)}`, rows => {
		res.status(200).json(rows);
	});
}