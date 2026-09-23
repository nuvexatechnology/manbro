Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile("c:\Users\Niyas\manbro\public\images\hero-couple-exact.png")

# Find non-background pixels (background is around R=9, G=29, B=18)
$minX = $b.Width
$maxX = 0
$minY = $b.Height
$maxY = 0

for ($y = 0; $y -lt $b.Height; $y += 5) {
    for ($x = 0; $x -lt $b.Width; $x += 5) {
        $c = $b.GetPixel($x, $y)
        # Background diff
        $diff = [Math]::Abs($c.R - 9) + [Math]::Abs($c.G - 29) + [Math]::Abs($c.B - 18)
        if ($diff -gt 35) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output ("Couple Bounding Box in hero-couple-exact.png: X={0} to {1}, Y={2} to {3}" -f $minX, $maxX, $minY, $maxY)
$b.Dispose()
