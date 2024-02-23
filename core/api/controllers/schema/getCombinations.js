module.exports = async function (req, res, utils) {
	const typeId = req.params.typeId;
	utils.ExecuteAction(res, `SELECT * from schema_combination where type_id = ${utils.Esc(typeId)}`, rows => {
		// also select from schema_combination_sequence
		const combinations = [];
		const promises = [];
		for (let i = 0; i < rows.length; i++) {
			const combination = rows[i];
			promises.push(new Promise(resolve => {
				utils.ExecuteAction(res, `SELECT * from schema_combination_sequence where schema_combination_id = ${utils.Esc(combination.schema_combination_id)}`, sequenceRows => {
					combination.sequence = sequenceRows;
					combinations.push(combination);
					resolve();
				});
			}));
		}
		Promise.all(promises).then(() => {
			// also get schema_combination_data
			const promises = [];
			for (let i = 0; i < combinations.length; i++) {
				const combination = combinations[i];
				promises.push(new Promise(resolve => {
					utils.ExecuteAction(res, `SELECT * from schema_combination_data where schema_combination_id = ${utils.Esc(combination.schema_combination_id)}`, dataRows => {
						combination.data = dataRows;
						resolve();
					});
				}));
			}
			Promise.all(promises).then(() => {
				res.status(200).json(combinations.sort((a, b) => a.schema_combination_id - b.schema_combination_id));
			});
		});
	});
}