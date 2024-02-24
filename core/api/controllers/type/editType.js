module.exports = async function (req, res, utils) {
	const { id } = req.params;
    const { name, code } = req.body;
	const cocFileName = req.files.editCocFile ? `${req.files.editCocFile[0].filename}` : null;
	const cnitFileName = req.files.editCNITFile ? `${req.files.editCNITFile[0].filename}` : null;

	const fileNameQuery = `SELECT coc_file, cnit_file FROM type WHERE type_id = ${utils.Esc(id)}`;
	utils.ExecuteAction(res, fileNameQuery, fileRows => {
		
		let query = `UPDATE type SET type_name = '${utils.Esc(name)}', type_code = '${utils.Esc(code)}'`;
		if (cocFileName)
			query += `, coc_file = '${utils.Esc(cocFileName)}'`;
		if (cnitFileName)
			query += `, cnit_file = '${utils.Esc(cnitFileName)}'`;
		query += ` WHERE type_id = ${utils.Esc(req.params.id)}`;

		utils.ExecuteAction(res, query, () => {
			if (cocFileName)
				utils.DeleteFileIfNotUsed(res, fileRows[0].coc_file);
			if (cnitFileName)
				utils.DeleteFileIfNotUsed(res, fileRows[0].cnit_file);
			
			res.status(200).json({info: 'successfully updated'})
		});
	});
}