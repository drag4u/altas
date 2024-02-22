module.exports = async function getAllTypes(req, res, utils) {
    const {id} = req.params;
	utils.ExecuteAction(res, `DELETE FROM type WHERE type_id = ${utils.Esc(id)}`, () => {
		utils.ExecuteAction(res, `SELECT * from matrix where type_id = ${utils.Esc(id)}`, rows => {
			utils.ExecuteAction(res, `DELETE from matrix where type_id = ${utils.Esc(id)}`, () => {
				if (rows.length == 0) {
					res.status(200).json({info: 'successfully deleted'});
				} else {
					let query = `DELETE FROM matrix_value WHERE matrix_id IN (`;
					rows.forEach(row => {
						query += `${utils.Esc(row.matrix_id)},`;
					});
					query = query.slice(0, -1);
					query += `);`;
					utils.ExecuteAction(res, query, () => {
						res.status(200).json({info: 'successfully deleted'});
					});
				}
			});
		});
	});
}