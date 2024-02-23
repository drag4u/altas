module.exports = async function (req, res, utils) {
    let query = `UPDATE type SET coc_file = null WHERE type_id = ${utils.Esc(req.params.id)}`;
	utils.ExecuteAction(res, query, () => res.status(200).json({info: 'successfully removed CoC file'}));
}