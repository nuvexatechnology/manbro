$bytes = [System.IO.File]::ReadAllBytes("c:\Users\Niyas\manbro\scripts\input.pdf")
$txt = [System.Text.Encoding]::ASCII.GetString($bytes)

# Let's search for /ColorSpace, /DeviceRGB, etc.
$matches = [regex]::Matches($txt, '<<[^>]*?/Subtype\s*/Image[^>]*?>>')
Write-Output "Image dictionaries found: $($matches.Count)"
foreach ($m in $matches) {
    Write-Output $m.Value
}
