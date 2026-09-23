$txt = [System.IO.File]::ReadAllText("c:\Users\Niyas\manbro\scripts\x1_stream_decompressed.txt")

$matches = [regex]::Matches($txt, '(?m)^\s*(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(scn|SCN)\s*\r?\n(.*?)(?=\b(?:f\*?|S|B\*?)\b)', [System.Text.RegularExpressions.RegexOptions]::Singleline)

Write-Output "Found $($matches.Count) colored drawing blocks:"

foreach ($m in $matches) {
    $r = [int][Math]::Round([double]$m.Groups[1].Value * 255)
    $g = [int][Math]::Round([double]$m.Groups[2].Value * 255)
    $b = [int][Math]::Round([double]$m.Groups[3].Value * 255)
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
    $body = $m.Groups[5].Value.Trim()
    
    # Check for 're' (rectangle: x y w h re)
    $reMatch = [regex]::Match($body, '([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+re')
    if ($reMatch.Success) {
        $x = [double]$reMatch.Groups[1].Value
        $y = [double]$reMatch.Groups[2].Value
        $w = [double]$reMatch.Groups[3].Value
        $h = [double]$reMatch.Groups[4].Value
        # Canvas height is 2066, so topY is 2066 - (y + h)
        $topY = 2066 - ($y + $h)
        Write-Output ("Color {0} -> RECT at x={1:F1}, topY={2:F1}, w={3:F1}, h={4:F1}" -f $hex, $x, $topY, $w, $h)
    } else {
        # Check first line of body
        $firstLine = ($body -split "\r?\n")[0]
        Write-Output ("Color {0} -> PATH starting: {1}" -f $hex, $firstLine)
    }
}
