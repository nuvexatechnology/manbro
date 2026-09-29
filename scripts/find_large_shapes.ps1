$txt = [System.IO.File]::ReadAllText("c:\Users\Niyas\manbro\scripts\x1_stream_decompressed.txt")

# Find all blocks of scn followed by m ... l ... l ...
$lines = $txt -split "\r?\n"
$lastColor = ""
for ($i = 0; $i -lt $lines.Length; $i++) {
    $l = $lines[$i].Trim()
    if ($l -match '^([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s+scn$') {
        $r = [int][Math]::Round([double]$Matches[1] * 255)
        $g = [int][Math]::Round([double]$Matches[2] * 255)
        $b = [int][Math]::Round([double]$Matches[3] * 255)
        $lastColor = "#{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
    }
    # Check if a large area is painted
    if ($l -match '^([\d\.\-]+)\s+([\d\.\-]+)\s+m$') {
        $x1 = [double]$Matches[1]; $y1 = [double]$Matches[2]
        if ($i + 1 -lt $lines.Length -and $lines[$i+1].Trim() -match '^([\d\.\-]+)\s+([\d\.\-]+)\s+l$') {
            $x2 = [double]$Matches[1]; $y2 = [double]$Matches[2]
            $dist = [Math]::Sqrt(($x2-$x1)*($x2-$x1) + ($y2-$y1)*($y2-$y1))
            if ($dist -gt 300) {
                Write-Output ("Line {0}: Large shape with color {1}: from ({2},{3}) to ({4},{5}) (dist={6:F1})" -f $i, $lastColor, $x1, $y1, $x2, $y2, $dist)
            }
        }
    }
}
