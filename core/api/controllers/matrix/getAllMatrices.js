module.exports = async function (req, res, utils) {
	const {id} = req.params;
		
	utils.ExecuteAction(res, `SELECT * from matrix where type_id = ${utils.Esc(id)}`, rows => {
		if (rows.length == 0) {
			res.status(200).json(rows);
		} else {
			let query = `SELECT * FROM matrix_value WHERE matrix_id IN (`;
			rows.forEach(row => {
				query += `${utils.Esc(row.matrix_id)},`;
			});
			query = query.slice(0, -1);
			query += `);`;
			utils.ExecuteAction(res, query, rows => {
				res.status(200).json(rows);
			});
		}
	});
}