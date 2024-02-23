module.exports = async function (req, res, utils) {
	const typeId = req.params.typeId;
	const { fieldName, fieldPlaceholder } = req.body;

	let query = `INSERT INTO schema_fields (type_id, field_name, field_placeholder) VALUES (${utils.Esc(typeId)}, '${utils.Esc(fieldName)}', '${utils.Esc(fieldPlaceholder)}')`;
	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully inserted'}));
}