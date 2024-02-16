function ShowGenerateCoCModal()
{
	if ($('#dataCollapse').hasClass('show'))
		$('#dataCollapse').removeClass('show');

	$('#cocGenerateModal').modal('show');
	API.GetAllTypes(response => {
		$('#cocTypeSelect').html('');
		response.forEach(type => {
			$('#cocTypeSelect').append(`<option value="${escapeHtml(type.type_id)}">${escapeHtml(type.type_name)}</option>`);
		});
		$('#cocTypeSelect').off('change').on('change', function() {
			$('.cocModalLoading').show();
			$('.otherCoCContent').hide();
			API.GetSchemaFields(this.value, schemaFields => {
				$('#cocCustomFieldHolder').html('');
				let index = 0;
				schemaFields.forEach(field => {
					$('#cocCustomFieldHolder').append(`
						<div class="input-group mb-1">
							<span class="input-group-text" id="customFieldAddon${index}">${escapeHtml(field.field_name)}</span>
							<input type="text" class="form-control" id="customField${index}" aria-describedby="customFieldAddon${index}">
						</div>
					`);
					index++;
				});

				API.GetType(this.value, typeData => {
					GetAllCombinations(this.value, combinations => {
						cocActiveCombinations = combinations;
						if (typeData[0].coc_file == null)
						{
							$('#CoCFileWarning').show();
							$('#cocGenerateButton').attr('disabled', true);
						} else {
							$('#CoCFileWarning').hide();
							$('#cocGenerateButton').attr('disabled', false );
						}
						API.GetSchema(this.value, response => {
							$('#cocVersionSelects').html('');
							for (let i = 0; i < typeData[0].version_columns; i++) {
								let selectElement = document.createElement('select');
								$(selectElement).addClass('form-select').addClass('form-select-sm').addClass('customSelect').addClass('versionSelect' + i);
								response.filter(c => c.version_variant == 0 && c.column == i).forEach(row => {
									$(selectElement).append(`<option value="${escapeHtml(row.schema_value_id)}">${escapeHtml(row.unique_matrix_value)}</option>`);
								});
								$('#cocVersionSelects').append(selectElement);
							}
							$('#cocVersionSelects').width(typeData[0].version_columns * 94);
		
							$('#cocVariantSelects').html('');
							for (let i = 0; i < typeData[0].variant_columns; i++) {
								let selectElement = document.createElement('select');
								$(selectElement).addClass('form-select').addClass('form-select-sm').addClass('customSelect').addClass('variantSelect' + i);
								response.filter(c => c.version_variant == 1 && c.column == i).forEach(row => {
									$(selectElement).append(`<option value="${escapeHtml(row.schema_value_id)}">${escapeHtml(row.unique_matrix_value)}</option>`);
								});
								$('#cocVariantSelects').append(selectElement);
							}
							$('#cocVariantSelects').width(typeData[0].variant_columns * 94);

							$('.cocModalLoading').hide();
							$('.otherCoCContent').show();
						});
					});
				});
			});
		}).trigger('change');
	});
}

function ShowGenerateCNITModal()
{
	$('#cnitGenerateModal').modal('show');
	$('#cnitSpinner').hide();
	$('#cnitButtonText').text('Generuoti');
	API.GetAllTypes(response => {
		$('#cnitTypeSelect').html('');
		response.forEach(type => {
			$('#cnitTypeSelect').append(`<option value="${escapeHtml(type.type_id)}">${escapeHtml(type.type_name)}</option>`);
		});
		$('#cnitTypeSelect').off('change').on('change', function() {
			API.GetType(this.value, typeData => {
				if (typeData[0].cnit_file == null)
				{
					$('#CNITFileWarning').show();
					$('#cnitGenerateButton').attr('disabled', true);
				} else {
					$('#CNITFileWarning').hide();
					$('#cnitGenerateButton').attr('disabled', false );
					$('#cnitGenerateButton').attr('onclick', `GenerateCNIT(${this.value})`);
				}
			});
		}).trigger('change');
	});
}

function GenerateCNIT(typeId)
{
	$('#cnitSpinner').show();
	$('#cnitGenerateButton').attr('disabled', true);
	$('#cnitButtonText').text('Generuojama...');
	API.GenerateCNIT(typeId, response => {
		if (response.error == undefined)
		{
			window.open("/files/temporary/" + response.fileName, "_blank");
		}
		$('#cnitGenerateModal').modal('hide');
	});
}

function GenerateCoC()
{
	const currentCombination = {variant: [], version: []};
	$('#cocVariantSelects .customSelect option:selected').toArray().forEach(c => currentCombination.variant.push(c.text));
	$('#cocVersionSelects .customSelect option:selected').toArray().forEach(c => currentCombination.version.push(c.text))

	if (combinationExists(cocActiveCombinations, currentCombination))
	{
		const typeId = $('#cocTypeSelect').val();
		CollectPlaceholderData(placeholderData => {
			API.GenerateCoC(typeId, placeholderData, (response) => {
				if (response.error == undefined)
				{
					window.open("/files/temporary/" + response.fileName, "_blank");
				}
			});
		});
	} else {
		alert('Pasirinkta kombinacija neegzistuoja tarp visų ' + cocActiveCombinations.length + ' tipo matricų kombinacijų!');
	}
}

function CollectAndShowPlaceholderData()
{
	if ($('#dataCollapse').hasClass('show'))
	{
		$('#dataCollapseButton').click();
	} else {
		CollectPlaceholderData(placeholderData => {
			$('#placeholderDataPreview').html('');
			placeholderData.forEach(row => {
				// append table rows
				$('#placeholderDataPreview').append(`
					<tr>
						<td>${row.placeholder}</td>
						<td>$\{${row.placeholder}}</td>
						<td>${row.data}</td>
					</tr>
				`);
			});
			$('#dataCollapseButton').click();
		});
	}
}

function CollectPlaceholderData(mainCallback)
{
	const typeId = $('#cocTypeSelect').val();
	let placeholderData = [];

	API.GetType(typeId, data => {
		let typeData = data[0];
		
		let variant = '';
		let version = '';
		$('#cocVariantSelects .customSelect option:selected').toArray().forEach(c => variant += $(c).text())
		$('#cocVersionSelects .customSelect option:selected').toArray().forEach(c => version += $(c).text())

		placeholderData.push({ placeholder: 'typeNumber', data: typeData.type_code});
		placeholderData.push({ placeholder: 'type', data: typeData.type_name})
		placeholderData.push({ placeholder: 'variant', data: variant});
		placeholderData.push({ placeholder: 'version', data: version})

		customInputFields = $('#cocCustomFieldHolder input')
		API.GetSchemaFields(typeId, data => {
			for(var i = 0; i != data.length; i++)
			{
				placeholderData.push({ placeholder: data[i].field_placeholder, data: customInputFields[i].value})
			}

			let variantValues = $('#cocVariantSelects .customSelect').toArray().map(c => c.value);
			let count = variantValues.length;
			let left = count;
			for (var i = 0; i != count; i++)
			{
				API.GetSchemaData(variantValues[i], data => {
					data.forEach(row => {
						placeholderData.push({ placeholder: row.placeholder, data: row.data})
					});
					left--;
					if (left == 0)
					{
						Continue();
					}
				});
			}
		})
	})

	function Continue()
	{
		let versionValues = $('#cocVersionSelects .customSelect').toArray().map(c => c.value);
		let count = versionValues.length;
		let left = count;
		for (var i = 0; i != count; i++)
		{
			API.GetSchemaData(versionValues[i], data => {
				data.forEach(row => {
					placeholderData.push({ placeholder: row.placeholder, data: row.data})
				});
				left--;
				if (left == 0)
				{
					ContinueFurther();
				}
			});
		}
	}

	function ContinueFurther()
	{
		console.log(placeholderData);
		API.GetSchemaCombinations(typeId, data => {
			let versionValues = $('#cocVersionSelects .customSelect').toArray().map(c => c.value);
			let variantValues = $('#cocVariantSelects .customSelect').toArray().map(c => c.value);
			data.forEach(combination => {
				let combinationMatch = combination.sequence.filter(c => versionValues.includes(c.schema_value_id.toString()) || variantValues.includes(c.schema_value_id.toString()));
				if (combinationMatch.length == combination.sequence.length)
				{
					combination.data.forEach(row => {
						placeholderData.push({ placeholder: row.field_placeholder, data: row.field_name})
					});
				}
			});
			mainCallback(placeholderData);
		});
	}
}

function combinationExists(combinations, targetCombination) {
	return combinations.some(combination => {
		// Check if variant arrays are equal
		const variantsMatch = compareArrays(combination.variant, targetCombination.variant);
		// Check if version arrays are equal
		const versionsMatch = compareArrays(combination.version, targetCombination.version);

		// If both variants and versions match, the combination exists
		return variantsMatch && versionsMatch;
	});
}

const compareArrays = (a, b) => {
	if (a.length !== b.length) return false;
	else {
	  // Comparing each element of the arrays
	  for (var i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
		  return false;
		}
	  }
	  return true;
	}
};