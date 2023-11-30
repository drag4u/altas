const jsonfile = require('jsonfile');

class Database
{
	constructor(file){
		this.file = file;
	}

	Read(callback){
		jsonfile.readFile(this.file, function (err, obj) {
			if (err) console.error(err);
			callback(obj);
		})
	}
	Write(data, callback){
		jsonfile.writeFile(this.file, data, function (err) {
			callback(err);
		})
		callback();
	}
}

module.exports = Database;