$bytes = [System.IO.File]::ReadAllBytes("c:\Users\Niyas\manbro\scripts\input.pdf")
$txt = [System.Text.Encoding]::ASCII.GetString($bytes)

$pageMatches = [regex]::Matches($txt, '(?s)<<[^>]*?/Type\s*/Page\b[^>]*?>>')
foreach ($pm in $pageMatches) {
    Write-Output "PAGE DICT:"
    Write-Output $pm.Value
}
