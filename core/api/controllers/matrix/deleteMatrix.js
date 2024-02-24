module.exports = async function (req, res, utils) {
	const {id} = req.params;
	utils.ExecuteAction(res, `SELECT type_id FROM matrix where matrix_id = ${utils.Esc(id)}`, typeRows => {
		const typeId = typeRows[0].type_id;
		
		utils.ExecuteAction(res, `DELETE FROM matrix WHERE matrix_id = ${utils.Esc(id)}`, () => {
			utils.ExecuteAction(res, `DELETE FROM matrix_value WHERE matrix_id = ${utils.Esc(id)}`, () => {
				utils.UpdateTypeSchema(res, typeId, () => {
					res.status(200).json({info: 'Matrix successfully deleted'});
				});
			});
		});
	});
}