$files = Get-ChildItem -Path "c:\Users\Niyas\manbro" -Recurse -Include *.tsx,*.ts,*.css -Exclude node_modules,.next,.git

$count = 0
foreach ($file in $files) {
    if ($file.FullName -like "*node_modules*" -or $file.FullName -like "*\.next\*") {
        continue
    }
    
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $modified = $false
    
    # 1. Main Background replacements
    if ($content -match '#032c0f|#043312') {
        $content = $content -replace '#032c0f', '#091D12'
        $content = $content -replace '#043312', '#091D12'
        $modified = $true
    }
    # 2. Container / Card Surface replacements
    if ($content -match '#063914|#0a461b') {
        $content = $content -replace '#063914', '#11301F'
        $content = $content -replace '#0a461b', '#11301F'
        $modified = $true
    }
    # 3. Border replacements
    if ($content -match '#0e471d') {
        $content = $content -replace '#0e471d', '#284234'
        $modified = $true
    }
    # 4. Product thumbnail background
    if ($content -match '#07150c') {
        $content = $content -replace '#07150c', '#082816'
        $modified = $true
    }
    
    if ($modified) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Updated $($file.Name)"
        $count++
    }
}

Write-Host "Total files updated to exact PDF palette: $count"
