module.exports = async function (req, res, utils) {
    const {id} = req.params;
	utils.ExecuteAction(res, `SELECT * FROM type where type_id = ${utils.Esc(id)}`, rows => {
		res.status(200).json(rows);
	});
}