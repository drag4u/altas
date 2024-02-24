function ShowTypeCreateModal()
{
	$('#createTypeModal').modal('show');
}

function GetAllCombinations(typeId, callback)
{
	API.GetAllMatrices(typeId, matrixData => {
		const orderedData = OrderMatricData(matrixData);
		let allCombinations = [];
		Object.keys(orderedData).forEach(matrixId => allCombinations.push(...generateCombinations(orderedData[matrixId])));
		callback(allCombinations);
	});
}

function UpdateTypeTable()
{
	API.GetAllTypes(response => {
		if (response.length == 0) {
			$('#typeTableWarning').show();
		} else {
			$('#typeTableWarning').hide();
		}
		const tBody = document.getElementById("typeTable");
		tBody.innerHTML = "";
		let typeIndex = 1;
		response.forEach(row => {
			const tr = document.createElement("tr");
			tr.appendChild(document.createElement("td")).innerText = typeIndex;
			tr.appendChild(document.createElement("td")).innerText = escapeHtml(row.type_name);
			tr.appendChild(document.createElement("td")).innerText = escapeHtml(row.type_code);
			tr.appendChild(document.createElement("td")).innerText = `${row.variant_columns}st. ${row.variant_rows}eil.`;
			tr.appendChild(document.createElement("td")).innerText = `${row.version_columns}st. ${row.version_rows}eil.`;
			let fileLink = document.createElement('a');
			fileLink.href = `http://${location.hostname}:3000/files/${row.coc_file}`;
			fileLink.textContent = row.coc_file;
			fileLink.target = '_blank';
			let fileLink2 = document.createElement('a');
			fileLink2.href = `http://${location.hostname}:3000/files/${row.cnit_file}`;
			fileLink2.textContent = row.cnit_file;
			fileLink2.target = '_blank';
			tr.appendChild(document.createElement("td")).append(fileLink);
			tr.appendChild(document.createElement("td")).append(fileLink2);
			let td = document.createElement("td");
			GetAllCombinations(row.type_id, combinations => {
				td.innerText = combinations.length;
			});
			tr.appendChild(td);
			tr.appendChild(document.createElement("td")).innerHTML = `
				<button type="button" class="btn btn-sm btn-primary" onclick="ShowMatrixPage(${row.type_id})">Matricos</button>
				<button type="button" class="btn btn-sm btn-primary" onclick="ShowSchemaPage(${row.type_id})"">Schema</button>
				<button type="button" class="btn btn-sm btn-warning" onclick="ShowTypeEditModal(${row.type_id})">Redaguoti</button>
				<button type="button" class="btn btn-sm btn-warning" onclick="ShowTypeCopyModal(${row.type_id})">Kopijuoti</button>
				<button type="button" class="btn btn-sm btn-danger" onClick="ShowTypeDeleteModal(this, ${row.type_id})">Ištrinti</button>
			`;
			tBody.appendChild(tr);
			typeIndex++;
		});
	});
}

function CreateType()
{
	const form = document.getElementById('typeForm');
	if (!form.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		form.classList.add('was-validated');
		return;
	}
	
	const formData = new FormData();
	formData.append("cocFile", document.getElementById("cocFile").files[0]);
	formData.append("cnitFile", document.getElementById("cnitFile").files[0]);
	formData.append("code", document.getElementById("typeCode").value);
	formData.append("name", document.getElementById("typeName").value);
	formData.append("versionColumns", document.getElementById("versionColumnAmount").value);
	formData.append("versionRows", document.getElementById("versionRowAmount").value);
	formData.append("variantColumns", document.getElementById("variantColumnAmount").value);
	formData.append("variantRows", document.getElementById("variantRowAmount").value);

	API.CreateType(formData, () => {
		$('#createTypeModal').modal('hide');
		UpdateTypeTable();
	});
}

function EditType()
{
	const form = document.getElementById('editTypeForm');
	if (!form.checkValidity()) {
		event.preventDefault();
		event.stopPropagation();
		form.classList.add('was-validated');
		return;
	}
	const formData = new FormData();
	formData.append("editCocFile", document.getElementById("editCocFile").files[0]);
	formData.append("editCNITFile", document.getElementById("editCNITFile").files[0]);
	formData.append("name", document.getElementById("editTypeName").value);
	formData.append("code", document.getElementById("editTypeCode").value);

	API.EditType(activeTypeData[0].type_id, formData, () => {
		$('#editTypeModal').modal('hide');
		UpdateTypeTable();
	});
}

function DeleteType()
{
	API.DeleteType(typeToBeDeleted, () => {
		$('#deleteTypeModal').modal('hide');
		UpdateTypeTable();
	});
}

function ShowTypePage() {
	$('#matrixPage').hide();
	$('#schemaPage').hide();
	$('#typePage').show();
	UpdateTypeTable(); // Refresh the type table if needed
}

function DeleteCoCFile()
{
	let typeId = activeTypeData[0].type_id;
	API.DeleteCoCFile(typeId, () => {
		$('#editCocFile').val('');
		ShowTypeEditModal(typeId, () => {});
	});
}

function DeleteCNITFile()
{
	let typeId = activeTypeData[0].type_id;
	API.DeleteCNITFile(typeId, () => {
		$('#editCNITFile').val('');
		ShowTypeEditModal(typeId, () => {});
	});
}

function ShowTypeEditModal(typeId, callback)
{
	API.GetType(typeId, typeData => {
		activeTypeData = typeData;
		$('#editTypeModal').modal('show');
		document.getElementById("editTypeName").value = typeData[0].type_name;
		document.getElementById("editTypeCode").value = typeData[0].type_code;
		document.getElementById("editCoCFileLabel").innerText = typeData[0].coc_file;
		document.getElementById("editCNITFileLabel").innerText = typeData[0].cnit_file;
		$('#CoCDeleteButton').attr('disabled', typeData[0].coc_file == null);
		$('#CNITDeleteButton').attr('disabled', typeData[0].cnit_file == null);
		$('#editTypeVersion').prop("checked", false);
		$('#editTypeVariant').prop("checked", false);
		ActivateTypeMatrixEditor(true);
		let varCol = activeTypeData[0].variant_columns;
		let varRow = activeTypeData[0].variant_rows;
		let verCol = activeTypeData[0].version_columns;
		let verRow = activeTypeData[0].version_rows;

		// this populates the versionMatrix with the correct amount of inputs
		let versionMatrix = document.getElementById("editTypeVersionMatrix");
		versionMatrix.innerHTML = "";
		for (let i = 0; i < verRow; i++) {
			let row = document.createElement("div");
			//row.classList.add("row");
			row.style.paddingBottom = "5px";
			row.style.width = ((verCol * 72) + 30) + "px";
			for (let j = 0; j < verCol; j++) {
				let input = document.createElement("input");
				input.style.width = "70px";
				input.style.marginRight = "2px";
				input.type = "text";
				input.disabled = true;
				input.style.display = "inline-block";
				input.style.border = "solid 1px #d0d0d0";
				input.style.borderRadius = "2px";
				$(input).attr("data-row", i);
				$(input).attr("data-col", j);
				row.appendChild(input);
			}
			versionMatrix.appendChild(row);
		}

		let variantMatrix = document.getElementById("editTypeVariantMatrix");
		variantMatrix.innerHTML = "";
		for (let i = 0; i < varRow; i++) {
			let row = document.createElement("div");
			row.style.paddingBottom = "5px";
			row.style.width = ((varCol * 72) + 30) + "px";
			for (let j = 0; j < varCol; j++) {
				let input = document.createElement("input");
				input.style.width = "70px";
				input.disabled = true;
				input.style.marginRight = "2px";
				input.type = "text";
				input.style.display = "inline-block";
				input.style.border = "solid 1px #d0d0d0";
				input.style.borderRadius = "2px";
				$(input).attr("data-row", i);
				$(input).attr("data-col", j);
				row.appendChild(input);
			}
			variantMatrix.appendChild(row);
		}

		API.GetAllMatrices(typeId, response =>
		{
			let orderedMatrices = OrderMatricData(response);
			const matrixIDs = Object.keys(orderedMatrices);
			if (matrixIDs.length > 0)
			{
				const firstMatrix = orderedMatrices[matrixIDs[0]];
				firstMatrix.forEach(row => {
					if (row.version_variant == 0) {
						$(`#editTypeVersionMatrix input[data-row=${row.row}][data-col=${row.column}]`).val(row.value);
					} else {
						$(`#editTypeVariantMatrix input[data-row=${row.row}][data-col=${row.column}]`).val(row.value);
					}
				});
			}
			callback?.();
		});
	});
}

function ShowTypeDeleteModal(target, id)
{
	target.parentNode.parentElement.classList.add("table-danger");
	setTimeout(() => target.parentNode.parentElement.classList.remove("table-danger"), 6000);
	typeToBeDeleted = id;
	$('#deleteTypeModal').modal('show');
}

function ShowTypeCopyModal(id)
{
	$('#typeCopySubmitButton').attr('onclick', `CopyType(${id})`);
	$('#copyTypeModal').modal('show');
}

function CopyType(id)
{
	API.CopyType(id, () => {
		$('#copyTypeModal').modal('hide');
		UpdateTypeTable();
	});
}

function ShowTypeDeleteModal(target, id)
{
	target.parentNode.parentElement.classList.add("table-danger");
	setTimeout(() => target.parentNode.parentElement.classList.remove("table-danger"), 6000);
	typeToBeDeleted = id;
	$('#deleteTypeModal').modal('show');
}

function generateCombinations(matrixData) {
    // Determine the highest column index for versions and variants
    let maxVersionColumn = 0;
    let maxVariantColumn = 0;

    matrixData.forEach(item => {
        if (item.version_variant === 0) {
            maxVersionColumn = Math.max(maxVersionColumn, item.column);
        } else if (item.version_variant === 1) {
            maxVariantColumn = Math.max(maxVariantColumn, item.column);
        }
    });

    // Initialize arrays to hold values for each column
    let versionValues = Array.from({ length: maxVersionColumn + 1 }, () => new Set());
    let variantValues = Array.from({ length: maxVariantColumn + 1 }, () => new Set());

    // Populate the Sets with values from matrixData
    matrixData.forEach(item => {
        if (item.version_variant === 0 && item.value !== '') {
            versionValues[item.column].add(item.value);
        } else if (item.version_variant === 1 && item.value !== '') {
            variantValues[item.column].add(item.value);
        }
    });

    // Convert Sets to Arrays for easier manipulation
    versionValues = versionValues.map(set => Array.from(set));
    variantValues = variantValues.map(set => Array.from(set));

    // Generate all combinations for versions and variants
    const versionCombinations = generateAllCombinations(versionValues);
    const variantCombinations = generateAllCombinations(variantValues);

    // Combine version and variant combinations into the result array
    const result = variantCombinations.map(variantCombo => {
        return versionCombinations.map(versionCombo => ({
            variant: variantCombo,
            version: versionCombo
        }));
    }).flat();

    return result;
}

// Recursive function to generate all combinations
function generateAllCombinations(valuesArrays, index = 0, result = [], current = []) {
    if (index === valuesArrays.length) {
        result.push([...current]);
        return;
    }

    for (let value of valuesArrays[index]) {
        current[index] = value;
        generateAllCombinations(valuesArrays, index + 1, result, current);
    }

    if (index === 0) return result;
}