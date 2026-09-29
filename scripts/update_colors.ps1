$files = Get-ChildItem -Path "c:\Users\Niyas\manbro" -Recurse -Include *.tsx,*.ts,*.css -Exclude node_modules,.next,.git

$count = 0
foreach ($file in $files) {
    if ($file.FullName -like "*node_modules*" -or $file.FullName -like "*\.next\*") {
        continue
    }
    
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $modified = $false
    
    # Background replacements
    if ($content -match '06140[cC]|07190f') {
        $content = $content -replace '#06140[cC]', '#032c0f'
        $content = $content -replace '#07190f', '#032c0f'
        $modified = $true
    }
    # Container surface
    if ($content -match '0b1c11') {
        $content = $content -replace '#0b1c11', '#063914'
        $modified = $true
    }
    # Border
    if ($content -match '16331f|1b3b24') {
        $content = $content -replace '#16331f', '#0e471d'
        $content = $content -replace '#1b3b24', '#0e471d'
        $modified = $true
    }
    # Gold accent
    if ($content -match 'd4a029') {
        $content = $content -replace '#d4a029', '#d4af37'
        $modified = $true
    }
    # Gold hover
    if ($content -match 'c29124') {
        $content = $content -replace '#c29124', '#c29e2e'
        $modified = $true
    }
    
    if ($modified) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Updated $($file.Name)"
        $count++
    }
}

Write-Host "Total files updated: $count"
