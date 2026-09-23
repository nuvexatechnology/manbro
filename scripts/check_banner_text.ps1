Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile("c:\Users\Niyas\manbro\public\images\hero-banner.png")
Write-Output "hero-banner.png from 405 0 obj: $($b.Width) x $($b.Height)"
# Check pixel at x=100, y=200 in hero-banner.png
$c = $b.GetPixel(100, 200)
Write-Output "Pixel at (100,200): #{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
# Check if left half has white text or is just plain dark green background
$brightCount = 0
for ($y = 50; $y -lt $b.Height; $y += 10) {
    for ($x = 50; $x -lt ($b.Width / 2); $x += 10) {
        $px = $b.GetPixel($x, $y)
        if ($px.R -gt 150 -and $px.G -gt 150 -and $px.B -gt 150) {
            $brightCount++
        }
    }
}
Write-Output "Bright pixels in left half: $brightCount"
$b.Dispose()
