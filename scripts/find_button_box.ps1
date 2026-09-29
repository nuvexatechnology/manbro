Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile("c:\Users\Niyas\manbro\public\images\hero-banner.png")

$minX = $b.Width
$maxX = 0
$minY = $b.Height
$maxY = 0

for ($y = 450; $y -lt $b.Height; $y++) {
    for ($x = 50; $x -lt ($b.Width * 0.35); $x++) {
        $c = $b.GetPixel($x, $y)
        # Gold button color: R > 200, G > 160, B < 90
        if ($c.R -gt 200 -and $c.G -gt 150 -and $c.B -lt 90) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output ("Button Bounding Box in 2100x749: X={0} to {1}, Y={2} to {3}" -f $minX, $maxX, $minY, $maxY)
$btnW = $maxX - $minX
$btnH = $maxY - $minY
Write-Output ("Button Width: {0}px, Height: {1}px" -f $btnW, $btnH)

$leftPct = ($minX / $b.Width) * 100
$topPct = ($minY / $b.Height) * 100
$wPct = ($btnW / $b.Width) * 100
$hPct = ($btnH / $b.Height) * 100

Write-Output ("Percentages: left={0:F2}%, top={1:F2}%, width={2:F2}%, height={3:F2}%" -f $leftPct, $topPct, $wPct, $hPct)
$b.Dispose()
