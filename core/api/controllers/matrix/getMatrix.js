module.exports = async function (req, res, utils) {
	const {id} = req.params;
	utils.ExecuteAction(res, `SELECT * FROM matrix_value WHERE matrix_id = ${utils.Esc(id)};`, rows => {
		res.status(200).json(rows);
	});
}