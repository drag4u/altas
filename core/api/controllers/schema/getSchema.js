module.exports = async function (req, res, utils) {
	const typeId = req.params.typeId;
		
	utils.ExecuteAction(res, `SELECT * from schema_values where type_id = ${utils.Esc(typeId)}`, rows => {
		res.status(200).json(rows);
	});
}