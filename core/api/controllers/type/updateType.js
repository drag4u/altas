module.exports = async function (req, res, utils) {
    const {id, name, versionColumns, versionRows, variantColumns, variantRows, coc_file, cnit_file} = req.body;
	var query = `UPDATE type SET type_name = '${utils.Esc(name)}', version_columns = ${utils.Esc(versionColumns)},  version_rows = ${utils.Esc(versionRows)}, 
		variant_columns = ${utils.Esc(variantColumns)}, variant_rows = ${utils.Esc(variantRows)}, ${coc_file ? `coc_file = '${utils.Esc(coc_file)}'` : ''}, ${cnit_file ? `cnit_file = '${utils.Esc(cnit_file)}'` : ''}
		WHERE type_id = ${utils.Esc(id)}
	`;
	utils.ExecuteAction(res, query, () => {
		res.status(200).json({info: 'successfully updated'});
	});
}