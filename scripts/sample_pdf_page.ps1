Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("c:\Users\Niyas\manbro\scripts\page_rendered.png")
Write-Output "Image Dimensions: $($bmp.Width) x $($bmp.Height)"

function GetHex($x, $y) {
    $c = $bmp.GetPixel($x, $y)
    return "#{0:X2}{1:X2}{2:X2} (R={3} G={4} B={5})" -f $c.R, $c.G, $c.B, $c.R, $c.G, $c.B
}

Write-Output "`n--- SAMPLING DOWN THE LEFT MARGIN (x=30) ---"
for ($pct = 1; $pct -le 99; $pct += 3) {
    $y = [int]($bmp.Height * $pct / 100)
    Write-Output ("y={0} ({1}%): {2}" -f $y, $pct, (GetHex 30 $y))
}

Write-Output "`n--- TOP 20 MOST FREQUENT COLORS ACROSS ENTIRE PAGE ---"
$colorFreq = @{}
for ($y = 0; $y -lt $bmp.Height; $y += 4) {
    for ($x = 0; $x -lt $bmp.Width; $x += 4) {
        $c = $bmp.GetPixel($x, $y)
        $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
        $colorFreq[$hex] = [int]$colorFreq[$hex] + 1
    }
}
$colorFreq.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 25 | ForEach-Object {
    Write-Output "$($_.Name): $($_.Value) pixels"
}

$bmp.Dispose()
