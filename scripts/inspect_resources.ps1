$bytes = [System.IO.File]::ReadAllBytes("c:\Users\Niyas\manbro\scripts\input.pdf")
$txt = [System.Text.Encoding]::ASCII.GetString($bytes)

$idx = $txt.IndexOf("6 0 obj")
Write-Output "Found 6 0 obj at $idx"
$end = $txt.IndexOf("endobj", $idx)
Write-Output $txt.Substring($idx, [Math]::Min(2000, $end - $idx + 6))
