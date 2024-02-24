module.exports = async function (req, res, utils) {
    const {id} = req.params;

	const fileNameQuery = `SELECT coc_file, cnit_file FROM type WHERE type_id = ${utils.Esc(id)}`;
	utils.ExecuteAction(res, fileNameQuery, fileRows => {
		const query = `
			delete from schema_combination_data where schema_combination_id in (
				select schema_combination_id from schema_combination where type_id = ${utils.Esc(id)}
		  	);
			delete from schema_combination_sequence where schema_combination_id in (
				select schema_combination_id from schema_combination where type_id = ${utils.Esc(id)}
			);
			delete from schema_combination where type_id = ${utils.Esc(id)};
			delete from schema_fields where type_id = ${utils.Esc(id)};
			delete from schema_data where schema_value_id in (
				select schema_value_id from schema_values where type_id = ${utils.Esc(id)}
			);
			delete from schema_values where type_id = ${utils.Esc(id)};
			delete from matrix_value where matrix_id in (
				select matrix_id from matrix where type_id = ${utils.Esc(id)}
		  	);
			delete from matrix where type_id = ${utils.Esc(id)};
			delete from type where type_id = ${utils.Esc(id)};
			commit;
		`;
		utils.ExecuteAction(res, query, (s) => {
			console.log(s);
			if (fileRows.length > 0) {
				utils.DeleteFileIfNotUsed(res, fileRows[0].coc_file);
				utils.DeleteFileIfNotUsed(res, fileRows[0].cnit_file);
			}
			res.status(200).json({info: 'successfully deleted'});
		});
	});
}