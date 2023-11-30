class ApiUtils
{
	constructor(logger, database)
	{
		this.logger = logger;
		this.database = database;
	}

	ExecuteAction(res, query, successCallback)
	{
		this.logger.info("executing query: " + query);
		this.database.all(query, (err, rows) => {
			if (err)
			{
				this.logger.error("Getting database error: " + err);
				res.status(500).json({error: 'Database error'});
			} else {
				successCallback(rows);
			}
		});
	}
}

module.exports = 
{
	ApiUtils
}