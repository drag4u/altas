const sqlite3 = require('sqlite3');

class DatabaseInitializer {

	fileName = 'data//mcu.db';
	mode = sqlite3.OPEN_READWRITE;
	cantOpen = "SQLITE_CANTOPEN";
	database;
	logger;

	constructor(logger, callback) {
		this.logger = logger;
		this.database = new sqlite3.Database(this.fileName, this.mode, err => {
			if (err && err.code == this.cantOpen) {
				this.logger.warn("Database not found. Creating new database.");
				this.CreateDatabase(() => {
					this.ListAllTables();
					callback();
				});
			} else if (err) {
				this.logger.error("Getting database error " + err);
				exit(1);
			} else {
				this.logger.info("Database initialized successfully");
				callback();
			}
		});
	}

	CreateDatabase(callback) {
		this.database = new sqlite3.Database(this.fileName, err => {
			if (err) {
				this.logger.error("Getting database error " + err);
				exit(1);
			}
			this.CreateTables(callback);
		});
	}

	CreateTables(callback) {
		this.logger.info("Creating database tables");
		this.database.exec(`
			create table type (
				type_id integer primary key AUTOINCREMENT,
				type_name text not null,
				type_code text not null,
				version_columns integer not null,
				version_rows integer not null,
				variant_columns integer not null,
				variant_rows integer not null,
				coc_file text,
				cnit_file text
			);
			create table matrix (
				matrix_id integer primary key AUTOINCREMENT,
				type_id integer not null
			);
			create table matrix_value (
				matrix_id integer not null,
				version_variant integer not null,
				row integer not null,
				column integer not null,
				value text not null
			);
			create table schema_values (
				schema_value_id integer primary key AUTOINCREMENT,
				type_id integer not null,
				version_variant integer not null,
				column integer not null,
				unique_matrix_value text not null,
				necessary integer not null
			);
			create table schema_data (
				schema_data_id integer primary key AUTOINCREMENT,
				schema_value_id integer not null,
				placeholder text not null,
				data text not null
			);
			create table schema_fields (
				schema_field_id integer primary key AUTOINCREMENT,
				type_id integer not null,
				field_name text not null,
				field_placeholder text not null
			);
		`, err  => {
			if (err) {
				this.logger.error("Getting database error when creating tables: " + err);
				exit(1);
			}
			this.logger.info("Database tables created");
			callback();
		});
	}

	ListAllTables() {
		this.database.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, rows) => {
			if (err) 
				this.logger.error("Getting database error when listing tables: " + err);
			rows.forEach(row => this.ListTableColumns(row.name));
		});
	}

	ListTableColumns(tableName) {
		this.database.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
			this.logger.info("Table name: " + tableName);
			if (err)
				this.logger.error("Getting database error when listing columns: " + err);
			rows.forEach(row => {
				this.logger.info(`${row.name} - ${row.type} - ${row.notnull} - ${row.pk}`);
			});
		});
	}
}

module.exports = {
	DatabaseInitializer
};