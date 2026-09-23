$bytes = [System.IO.File]::ReadAllBytes('C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1789988515958.pdf')
$txt = [System.Text.Encoding]::ASCII.GetString($bytes)
Write-Output "PDF Length: $($bytes.Length)"
$m = [regex]::Matches($txt, '/(Creator|Producer|Title)\s*\((.*?)\)')
foreach ($x in $m) { 
    Write-Output $x.Value 
}
$objs = [regex]::Matches($txt, '/Subtype\s*/Image')
Write-Output "Image objects: $($objs.Count)"
