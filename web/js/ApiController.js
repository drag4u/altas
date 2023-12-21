class ApiController
{
	mainUrl = location.hostname;
	// MATRIX
	GetAllMatrices(typeId, callback)
	{
		$.ajax({
			url: "http://"+ this.mainUrl + ":3000/matrix/all/" + typeId,
			type: "GET",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	CreateMatrix(typeId, tableInfo, callback)
	{
		$.ajax({
			url: "http://"+ this.mainUrl + ":3000/matrix/create/" + typeId,
			type: "POST",
			contentType : 'application/json',
			dataType: "json",
			data: JSON.stringify({ tableInfo }),
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	EditMatrix(matrixId, tableInfo, callback)
	{
		$.ajax({
			url: "http://"+ this.mainUrl + ":3000/matrix/edit/" + matrixId,
			type: "POST",
			contentType : 'application/json',
			dataType: "json",
			data: JSON.stringify({tableInfo}),
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	CopyMatrix(typeId, matrixId, callback)
	{
		// todo typeId is not needed, can get it from matrix table
		$.ajax({
			url: `http://${this.mainUrl}:3000/matrix/copy/${typeId}/${matrixId}`,
			type: "POST",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	DeleteMatrix(matrixId, callback)
	{
		$.ajax({
			url: `http://${this.mainUrl}:3000/matrix/${matrixId}`,
			type: "DELETE",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	// TYPE
	GetType(typeId, callback)
	{
		$.ajax({
			url: `http://${this.mainUrl}:3000/type/${typeId}`,
			type: "GET",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	GetAllTypes(callback)
	{
		$.ajax({
			url: "http://"+ this.mainUrl + ":3000/type/all",
			type: "GET",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	CreateType(formData, callback)
	{
		$.ajax({
			url: "http://"+ this.mainUrl + ":3000/type/create",
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	EditType(typeId, formData, callback)
	{
		$.ajax({
			url: "http://"+ this.mainUrl + ":3000/type/edit/" + typeId,
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	DeleteCoCFile(typeId, callback)
	{
		$.ajax({
			url: "http://"+ this.mainUrl + ":3000/type/removeCoC/" + typeId,
			type: "POST",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	EditTypeRemoveColumn(typeId, versionVariant, columnId, callback)
	{
		$.ajax({
			url: `http://${this.mainUrl}:3000/type/removeColumn/${typeId}/${versionVariant}/${columnId}`,
			type: "POST",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	EditTypeAddColumn(typeId, versionVariant, columnId, callback)
	{
		$.ajax({
			url: `http://${this.mainUrl}:3000/type/addColumn/${typeId}/${versionVariant}/${columnId}`,
			type: "POST",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	EditTypeRemoveRow(typeId, versionVariant, columnId, callback)
	{
		$.ajax({
			url: `http://${this.mainUrl}:3000/type/removeRow/${typeId}/${versionVariant}/${columnId}`,
			type: "POST",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	EditTypeAddRow(typeId, versionVariant, columnId, callback)
	{
		$.ajax({
			url: `http://${this.mainUrl}:3000/type/addRow/${typeId}/${versionVariant}/${columnId}`,
			type: "POST",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	DeleteType(typeId, callback)
	{
		$.ajax({
			url: `http://${this.mainUrl}:3000/type/${typeId}`,
			type: "DELETE",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	GetSchema(typeId, callback)
	{
		$.ajax({
			url: `http://${this.mainUrl}:3000/schema/${typeId}`,
			type: "GET",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	GetSchemaData(valueId, callback)
	{
		$.ajax({
			url: `http://${this.mainUrl}:3000/schema/data/${valueId}`,
			type: "GET",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	CreateSchemaData(valueId, placeholder, data, callback)
	{
		$.ajax({
			url: "http://"+ this.mainUrl + ":3000/schema/create/" + valueId,
			type: "POST",
			contentType : 'application/json',
			dataType: "json",
			data: JSON.stringify({ placeholder, data }),
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	EditSchemaData(schemaDataId, placeholder, data, callback)
	{
		$.ajax({
			url: "http://"+ this.mainUrl + ":3000/schema/edit/" + schemaDataId,
			type: "POST",
			contentType : 'application/json',
			dataType: "json",
			data: JSON.stringify({ placeholder, data }),
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	UpdateSchemaNecessity(schemaDataId, necessity, callback)
	{
		$.ajax({
			url: "http://"+ this.mainUrl + ":3000/schema/necessity/" + schemaDataId,
			type: "POST",
			contentType : 'application/json',
			dataType: "json",
			data: JSON.stringify({ necessity }),
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}

	DeleteSchemaData(schemaDataId, callback)
	{
		$.ajax({
			url: `http://${this.mainUrl}:3000/schema/delete/${schemaDataId}`,
			type: "DELETE",
			dataType: "json",
			success: response => callback(response),
			error: (xhr, status) => console.log(xhr, status)
		});
	}
}