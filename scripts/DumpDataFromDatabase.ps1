$envVars = Get-Content backend.env | Foreach-Object {
	if ($_ -match "^\s*$") { return }

	$name, $value = $_ -split "=", 2
	$name = $name.Trim()
	$value = $value.Trim()
	Set-Item -Path "Env:\$name" -Value $value
}

& {
	vimi-backend dumpdata --all --indent 2 --output fixtures/initial_data.json;
}

$envVars | Foreach-Object {
	$name = $_ -split "=" | Select-Object -First 1
	Remove-Item "Env:\$name.Trim()"
}