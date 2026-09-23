$pdfPath = "C:\Users\Niyas\.gemini\antigravity-ide\brain\6f4b4922-ffb7-4d44-aa9c-611a632fee06\.user_uploaded\media_1789920378898.pdf"
$bytes = [System.IO.File]::ReadAllBytes($pdfPath)
Write-Output "PDF File Size: $($bytes.Length) bytes"

# Search for color operators like "r g b rg" or hex codes
$text = [System.Text.Encoding]::ASCII.GetString($bytes)
$matches = [regex]::Matches($text, '(?i)(#[0-9a-f]{6}|0x[0-9a-f]{6})')
Write-Output "Found hex codes in PDF text:"
foreach ($m in $matches) {
    Write-Output $m.Value
}

# Also search for "rg" operators (PDF RGB color selection: "0.12 0.34 0.56 rg")
$rgMatches = [regex]::Matches($text, '(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+rg')
Write-Output "`nFound RGB fill operators in PDF:"
$seen = @{}
foreach ($m in $rgMatches) {
    $r = [Math]::Round([double]$m.Groups[1].Value * 255)
    $g = [Math]::Round([double]$m.Groups[2].Value * 255)
    $b = [Math]::Round([double]$m.Groups[3].Value * 255)
    $key = "#{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
    if (-not $seen[$key]) {
        $seen[$key] = $true
        Write-Output "$key (R=$r, G=$g, B=$b) raw: $($m.Value)"
    }
}
