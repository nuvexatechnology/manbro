Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile("c:\Users\Niyas\manbro\public\images\hero-banner.png")
Write-Output "Dimensions: $($b.Width) x $($b.Height)"

# Sample where "BUILD DIFFERENT." should be (around x = 100 to 500, y = 150 to 300)
# Look for gold and white pixels
$goldCount = 0
$whiteCount = 0
for ($y = 0; $y -lt $b.Height; $y += 5) {
    for ($x = 0; $x -lt ($b.Width * 0.4); $x += 5) {
        $px = $b.GetPixel($x, $y)
        if ($px.R -gt 200 -and $px.G -gt 200 -and $px.B -gt 200) { $whiteCount++ }
        if ($px.R -gt 200 -and $px.G -gt 150 -and $px.B -lt 100) { $goldCount++ }
    }
}
Write-Output "In left 40%: White pixels = $whiteCount, Gold pixels = $goldCount"

# Also check the button area
# In 1024x365 it was at (70, 270) to (180, 315)
# In 2100x749, scale is ~2.05, so button is at (140, 550) to (370, 650)
$buttonPixels = 0
for ($y = 540; $y -le 660; $y += 5) {
    for ($x = 100; $x -le 400; $x += 5) {
        $px = $b.GetPixel($x, $y)
        if ($px.R -gt 200 -and $px.G -gt 150 -and $px.B -lt 100) { $buttonPixels++ }
    }
}
Write-Output "Button gold pixels: $buttonPixels"
$b.Dispose()
