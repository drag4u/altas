module.exports = async function (req, res, utils) {
	const fieldId = req.params.fieldId;
		
	utils.ExecuteAction(res, `SELECT * from schema_fields where type_id = ${utils.Esc(fieldId)}`, rows => {
		res.status(200).json(rows);
	});
}