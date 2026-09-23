Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1789999376093.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)
Write-Output "Width: $($bmp.Width), Height: $($bmp.Height)"

# Sample corner pixels (which are checkerboard pattern)
for ($y = 0; $y -lt 30; $y += 10) {
    for ($x = 0; $x -lt 30; $x += 10) {
        $c = $bmp.GetPixel($x, $y)
        Write-Output "Corner ($x,$y): R=$($c.R), G=$($c.G), B=$($c.B)"
    }
}

# Find bounding box of non-checkerboard pixels
# Checkerboard pattern consists of light grey (~204) and white/lighter grey (~255 or ~238) where R, G, B are roughly equal (saturation is 0)
# Gold pixels have high saturation (R > G > B, specifically R ~ 180-230, G ~ 150-190, B ~ 70-110)
$minX = $bmp.Width
$maxX = 0
$minY = $bmp.Height
$maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # Gold check: R > 120 and G > 100 and (R - B) > 30 and (G - B) > 20
        if ($c.R - $c.B -gt 30 -and $c.G - $c.B -gt 20) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Gold Bounding Box: minX=$minX, maxX=$maxX, minY=$minY, maxY=$maxY"
Write-Output "Gold Width: $($maxX - $minX + 1), Gold Height: $($maxY - $minY + 1)"
$bmp.Dispose()
