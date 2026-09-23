$txt = [System.IO.File]::ReadAllText("c:\Users\Niyas\manbro\scripts\x1_stream_decompressed.txt")

Write-Output "File size: $($txt.Length) characters"

# Search for RGB color commands (rg, RG, sc, scn, SC, SCN)
$rgMatches = [regex]::Matches($txt, '(?m)^\s*(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(rg|RG|sc|scn|SC|SCN)\b')
Write-Output "Found $($rgMatches.Count) color commands"

$colors = @{}
foreach ($m in $rgMatches) {
    $r = [int][Math]::Round([double]$m.Groups[1].Value * 255)
    $g = [int][Math]::Round([double]$m.Groups[2].Value * 255)
    $b = [int][Math]::Round([double]$m.Groups[3].Value * 255)
    $op = $m.Groups[4].Value
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
    if (-not $colors[$hex]) {
        $colors[$hex] = @{ R=$r; G=$g; B=$b; Count=0; Ops=@{} }
    }
    $colors[$hex].Count++
    $colors[$hex].Ops[$op] = [int]$colors[$hex].Ops[$op] + 1
}

Write-Output "`n=== ALL EXACT COLORS USED IN PDF GRAPHICS (Sorted by frequency) ==="
$colors.GetEnumerator() | Sort-Object { $_.Value.Count } -Descending | ForEach-Object {
    $c = $_.Value
    $ops = ($c.Ops.GetEnumerator() | ForEach-Object { "$($_.Key) x$($_.Value)" }) -join ", "
    Write-Output ("{0} (R={1,3}, G={2,3}, B={3,3}) -> {4,4} times [{5}]" -f $_.Name, $c.R, $c.G, $c.B, $c.Count, $ops)
}
