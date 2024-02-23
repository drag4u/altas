module.exports = async function (req, res, utils) {
	const fieldId = req.params.fieldId;
	const { fieldName, fieldPlaceholder } = req.body;

	let query = `UPDATE schema_fields SET field_name = '${utils.Esc(fieldName)}', field_placeholder = '${utils.Esc(fieldPlaceholder)}' WHERE schema_field_id = ${utils.Esc(fieldId)}`;
	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
}