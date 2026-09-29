Add-Type -AssemblyName System.Drawing
$filePath = "C:\Users\Niyas\.gemini\antigravity-ide\brain\6f4b4922-ffb7-4d44-aa9c-611a632fee06\.user_uploaded\media_1789920540099.png"
$bmp = [System.Drawing.Bitmap]::FromFile($filePath)

# Let's inspect the entire left column (x=0)
Write-Host "Left column (x=0) vs #032c0f (3, 44, 15):"
for ($y = 0; $y -lt $bmp.Height; $y += 30) {
    $c = $bmp.GetPixel(0, $y)
    Write-Host "y=$y : R=$($c.R), G=$($c.G), B=$($c.B)"
}

# Let's check x=0 to x=200 at y=180
Write-Host "`nHorizontal line y=180, x=0 to 300:"
for ($x = 0; $x -le 300; $x += 30) {
    $c = $bmp.GetPixel($x, 180)
    Write-Host "x=$x : R=$($c.R), G=$($c.G), B=$($c.B)"
}

$bmp.Dispose()
