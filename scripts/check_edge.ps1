Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1789999376093.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

# Check colors along a horizontal line crossing the left outer edge: Y = 200, X from 360 to 420
Write-Output "Horizontal line at Y=200 crossing left edge:"
for ($x = 365; $x -le 400; $x++) {
    $c = $bmp.GetPixel($x, 200)
    $sat = $c.R - $c.B
    Write-Output "X=$x : R=$($c.R), G=$($c.G), B=$($c.B) (R-B=$sat)"
}
$bmp.Dispose()
