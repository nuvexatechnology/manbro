Add-Type -AssemblyName System.Drawing
$filePath = "C:\Users\Niyas\.gemini\antigravity-ide\brain\6f4b4922-ffb7-4d44-aa9c-611a632fee06\.user_uploaded\media_1789920540099.png"
$bmp = [System.Drawing.Bitmap]::FromFile($filePath)
Write-Output "Image Size: $($bmp.Width) x $($bmp.Height)"

# Sample pixels on left edge (x=0, different y's)
Write-Output "Left edge pixels:"
for ($y = 0; $y -lt $bmp.Height; $y += 50) {
    $c = $bmp.GetPixel(0, $y)
    Write-Output "y=$y : R=$($c.R), G=$($c.G), B=$($c.B) (Hex: #{0:X2}{1:X2}{2:X2})" -f $c.R, $c.G, $c.B
}

# Sample pixels on right edge (x=$bmp.Width - 1, different y's)
Write-Output "`nRight edge pixels:"
for ($y = 0; $y -lt $bmp.Height; $y += 50) {
    $c = $bmp.GetPixel($bmp.Width - 1, $y)
    Write-Output "y=$y : R=$($c.R), G=$($c.G), B=$($c.B) (Hex: #{0:X2}{1:X2}{2:X2})" -f $c.R, $c.G, $c.B
}

# Sample pixels on top edge
Write-Output "`nTop edge pixels:"
for ($x = 0; $x -lt $bmp.Width; $x += 200) {
    $c = $bmp.GetPixel($x, 0)
    Write-Output "x=$x : R=$($c.R), G=$($c.G), B=$($c.B) (Hex: #{0:X2}{1:X2}{2:X2})" -f $c.R, $c.G, $c.B
}

# Sample pixels on bottom edge
Write-Output "`nBottom edge pixels:"
for ($x = 0; $x -lt $bmp.Width; $x += 200) {
    $c = $bmp.GetPixel($x, $bmp.Height - 1)
    Write-Output "x=$x : R=$($c.R), G=$($c.G), B=$($c.B) (Hex: #{0:X2}{1:X2}{2:X2})" -f $c.R, $c.G, $c.B
}

$bmp.Dispose()
