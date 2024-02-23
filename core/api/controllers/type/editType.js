module.exports = async function (req, res, utils) {
    const { name, code } = req.body;
	const cocFileName = req.files.editCocFile ? `${req.files.editCocFile[0].filename}` : null;
	const cnitFileName = req.files.editCNITFile ? `${req.files.editCNITFile[0].filename}` : null;
	
	let query = `UPDATE type SET type_name = '${utils.Esc(name)}', type_code = '${utils.Esc(code)}'`;
	if (cocFileName)
		query += `, coc_file = '${utils.Esc(cocFileName)}'`;
	if (cnitFileName)
		query += `, cnit_file = '${utils.Esc(cnitFileName)}'`;
	query += ` WHERE type_id = ${utils.Esc(req.params.id)}`;

	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully updated'}));
}