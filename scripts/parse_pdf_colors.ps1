$txt = [System.IO.File]::ReadAllText("c:\Users\Niyas\manbro\scripts\page_stream_decompressed.txt")

Write-Output "=== UNIQUE RGB COLORS (rg and RG) ==="
$rgMatches = [regex]::Matches($txt, '(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(rg|RG)')
$colors = @{}
foreach ($m in $rgMatches) {
    $r = [Math]::Round([double]$m.Groups[1].Value * 255)
    $g = [Math]::Round([double]$m.Groups[2].Value * 255)
    $b = [Math]::Round([double]$m.Groups[3].Value * 255)
    $op = $m.Groups[4].Value
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
    if (-not $colors[$hex]) {
        $colors[$hex] = @{ R=$r; G=$g; B=$b; Ops=@{}; Raw=$m.Value }
    }
    $colors[$hex].Ops[$op] = [int]$colors[$hex].Ops[$op] + 1
}

$colors.GetEnumerator() | Sort-Object { $_.Value.R * 65536 + $_.Value.G * 256 + $_.Value.B } | ForEach-Object {
    $c = $_.Value
    $opStr = ($c.Ops.GetEnumerator() | ForEach-Object { "$($_.Key): $($_.Value)" }) -join ", "
    Write-Output ("{0} -> RGB({1}, {2}, {3}) | {4}" -f $_.Name, $c.R, $c.G, $c.B, $opStr)
}
