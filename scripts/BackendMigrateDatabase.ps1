$envVars = Get-Content backend.env | Foreach-Object {
    if ($_ -match "^\s*$") { return }

    $name, $value = $_ -split "=", 2
    $name = $name.Trim()
    $value = $value.Trim()
    Set-Item -Path "Env:\$name" -Value $value
}

& {
    vimi-backend makemigrations;
    vimi-backend migrate;
    vimi-backend createsuperuser --username "$env:DJANGO_SUPERUSER_USERNAME" --email "$env:DJANGO_SUPERUSER_EMAIL" --noinput;
}

$envVars | Foreach-Object {
    $name = $_ -split "=" | Select-Object -First 1
    Remove-Item "Env:\$name.Trim()"
}