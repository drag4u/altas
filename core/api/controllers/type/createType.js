module.exports = async function (req, res, utils) {
    const { name, code, versionColumns, versionRows, variantColumns, variantRows } = req.body;
	const cocFileName = req.files.cocFile ? `${req.files.cocFile[0].filename}` : null;
	const cnitFileName = req.files.cnitFile ? `${req.files.cnitFile[0].filename}` : null;

	let query = `
		INSERT INTO type (
			type_name, type_code, version_columns, version_rows, variant_columns, variant_rows ${cocFileName ? ', coc_file' : ''} ${cnitFileName ? ', cnit_file' : ''}
		) VALUES (
			'${utils.Esc(name)}', '${utils.Esc(code)}', ${utils.Esc(versionColumns)}, ${utils.Esc(versionRows)}, ${utils.Esc(variantColumns)}, ${utils.Esc(variantRows)}
			${cocFileName ? `, '${utils.Esc(cocFileName)}'` : ''} ${cnitFileName ? `, '${utils.Esc(cnitFileName)}'` : ''}
		)
	`;

	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
}