$txt = [System.IO.File]::ReadAllText("c:\Users\Niyas\manbro\scripts\page_stream_decompressed.txt")

# Find color settings
$colorLines = [regex]::Matches($txt, '(?m)^.*?(\bscn\b|\bSCN\b|\bsc\b|\bSC\b|\brg\b|\bRG\b|\bk\b|\bK\b|\bg\b|\bG\b).*?$')
Write-Output "Total color setting lines: $($colorLines.Count)"

$uniqueColors = @{}
foreach ($line in $colorLines) {
    $val = $line.Value.Trim()
    $uniqueColors[$val] = [int]$uniqueColors[$val] + 1
}

$uniqueColors.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
    Write-Output "$($_.Name): $($_.Value) times"
}
