$('#removeColumnSubmit, #addColumnSubmit, #removeRowSubmit, #addRowSubmit').click(function() {
	const value = $(this).parent().prev().children()[0].value;
	if (value == '') 
		return;

	const versionChecked = $('#editTypeVersion').prop("checked");
	const variantChecked = $('#editTypeVariant').prop("checked");
	if (!versionChecked && !variantChecked) 
		return;

	const versionVariant = versionChecked ? 0 : 1;
	const typeId = activeTypeData[0].type_id;
	const callback = () => ShowTypeEditModal(typeId, () => {
		if (versionChecked)
			$('#editTypeVersion').prop("checked", versionChecked).trigger("change");
		else
			$('#editTypeVariant').prop("checked", variantChecked).trigger("change");
	});

	switch (this.id) {
		case 'removeColumnSubmit':
			if (versionChecked && activeTypeData[0].version_columns == 1)
			{
				alert("Negalima pašalinti paskutinio stulpelio!");
				return;
			}
			if (variantChecked && activeTypeData[0].variant_columns == 1)
			{
				alert("Negalima pašalinti paskutinio stulpelio!");
				return;
			}
			API.EditTypeRemoveColumn(typeId, versionVariant, value, callback);
			break;
		case 'addColumnSubmit':
			API.EditTypeAddColumn(typeId, versionVariant, value, callback);
			break;
		case 'removeRowSubmit':
			if (versionChecked && activeTypeData[0].version_rows == 1)
			{
				alert("Negalima pašalinti paskutinės eilutės!");
				return;
			}
			if (variantChecked && activeTypeData[0].variant_rows == 1)
			{
				alert("Negalima pašalinti paskutinės eilutės!");
				return;
			}
			API.EditTypeRemoveRow(typeId, versionVariant, value, callback);
			break;
		case 'addRowSubmit':
			API.EditTypeAddRow(typeId, versionVariant, value, callback);
			break;
	}
});

$('#editTypeVersion').change(function() {
	if (this.checked) {
		ClearAllHighlights();
		$('#removeColumn').val('');
		$('#addColumn').val('');
		$('#removeRow').val('');
		$('#addRow').val('');
		$('#editTypeVariant').prop("checked", false);
		ActivateTypeMatrixEditor(false);
		SetInputLimits(true);
	} else {
		ActivateTypeMatrixEditor(true);
	}
});

$('#editTypeVariant').change(function() {
	if (this.checked) {
		ClearAllHighlights();
		$('#editTypeVersion').prop("checked", false);
		ActivateTypeMatrixEditor(false);
		SetInputLimits(false);
	} else {
		ActivateTypeMatrixEditor(true);
	}
});

function ActivateTypeMatrixEditor(toggle)
{
	$('#removeColumn').val('');
	$('#addColumn').val('');
	$('#removeRow').val('');
	$('#addRow').val('');
	$('#removeColumn').prop('disabled', toggle);
	$('#addColumn').prop('disabled', toggle);
	$('#removeRow').prop('disabled', toggle);
	$('#addRow').prop('disabled', toggle);
	$('#removeColumnSubmit').prop('disabled', toggle);
	$('#addColumnSubmit').prop('disabled', toggle);
	$('#removeRowSubmit').prop('disabled', toggle);
	$('#addRowSubmit').prop('disabled', toggle);
}

function SetInputLimits(version)
{
	columns = version ? activeTypeData[0].version_columns : activeTypeData[0].variant_columns;
	rows = version ? activeTypeData[0].version_rows : activeTypeData[0].variant_rows;
	$('#removeColumn').attr({"max" : columns - 1});
	$('#addColumn').attr({"max" : columns});
	$('#removeRow').attr({"max" : rows - 1});
	$('#addRow').attr({"max" : rows});
}

$('#addColumn').on("change", () => {
	const versionChecked = $('#editTypeVersion').prop("checked");
	const variantChecked = $('#editTypeVariant').prop("checked");
	let target;
	let columns;
	if (variantChecked)
	{
		target = $('#editTypeVariantMatrix');
		columns = activeTypeData[0].variant_columns;
	}
	else if (versionChecked)
	{
		target = $('#editTypeVersionMatrix');
		columns = activeTypeData[0].version_columns;
	}
	else return;

	const value = parseInt($('#addColumn').val());
	HighlightColumnSpaces(target, value, value == columns);
});

$('#addRow').on("change", () => {
	const versionChecked = $('#editTypeVersion').prop("checked");
	const variantChecked = $('#editTypeVariant').prop("checked");
	let target;
	let rows;
	if (variantChecked)
	{
		target = $('#editTypeVariantMatrix');
		rows = activeTypeData[0].variant_rows;
	}
	else if (versionChecked)
	{
		target = $('#editTypeVersionMatrix');
		rows = activeTypeData[0].version_rows;
	}
	else return;

	const value = parseInt($('#addRow').val());
	HighlightRowSpaces(target, value, value == rows);
});

$('#removeColumn').on("change", () => {
	const versionChecked = $('#editTypeVersion').prop("checked");
	const variantChecked = $('#editTypeVariant').prop("checked");
	let target;
	if (variantChecked)
	{
		target = $('#editTypeVariantMatrix');
	}
	else if (versionChecked)
	{
		target = $('#editTypeVersionMatrix');
	}
	else return;

	const value = parseInt($('#removeColumn').val());
	HighlightColumns(target, value);
});

$('#removeRow').on("change", () => {
	const versionChecked = $('#editTypeVersion').prop("checked");
	const variantChecked = $('#editTypeVariant').prop("checked");
	let target;
	if (variantChecked)
	{
		target = $('#editTypeVariantMatrix');
	}
	else if (versionChecked)
	{
		target = $('#editTypeVersionMatrix');
	}
	else return;

	const value = parseInt($('#removeRow').val());
	HighlightRows(target, value);
});

function HighlightColumnSpaces(targetMatrix, id, invert)
{
	if (invert)
		id--;
	ClearAllHighlights();
	$(targetMatrix).find('input').each((index, value) => {
		columnIndex = $(value).attr("data-col");
		if (columnIndex == id){
			offset = 3 * (invert ? 1 : -1)
			value.style.boxShadow = offset + "px 0px 0px 0px rgb(254 192 45)";
		}
	})
}

function HighlightRowSpaces(targetMatrix, id, invert)
{
	if (invert)
		id--;
	ClearAllHighlights();
	$(targetMatrix).find('input').each((index, value) => {
		rowIndex = $(value).attr("data-row");
		if (rowIndex == id){
			offset = 3 * (invert ? 1 : -1)
			value.style.boxShadow = "0px " + offset + "px 0px 0px rgb(254 192 45)";
		}
	})
}

function HighlightColumns(targetMatrix, id)
{
	ClearAllHighlights();
	$(targetMatrix).find('input').each((index, value) => {
		columnIndex = $(value).attr("data-col");
		if (columnIndex == id){
			value.style.background = "#db3348";
		}
	})
}

function HighlightRows(targetMatrix, id)
{
	ClearAllHighlights();
	$(targetMatrix).find('input').each((index, value) => {
		rowIndex = $(value).attr("data-row");
		if (rowIndex == id){
			value.style.background = "#db3348";
		}
	})
}

function ClearAllHighlights()
{
	$('#editTypeVersionMatrix input, #editTypeVariantMatrix input').each((index, value) => {
		value.style.boxShadow = "";
		value.style.background = "";
	});
}