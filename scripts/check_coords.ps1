Add-Type -AssemblyName System.Drawing
$filePath = "C:\Users\Niyas\.gemini\antigravity-ide\brain\6f4b4922-ffb7-4d44-aa9c-611a632fee06\.user_uploaded\media_1789920540099.png"
$bmp = [System.Drawing.Bitmap]::FromFile($filePath)

Write-Host "Width: $($bmp.Width), Height: $($bmp.Height)"

# Let's inspect where the woman starts:
# In the middle (y=200), let's scan from x=400 to x=600 to find where non-dark pixels begin (the woman's arm/shirt)
for ($x = 400; $x -lt 650; $x += 20) {
    $c = $bmp.GetPixel($x, 200)
    Write-Host "x=$x : R=$($c.R), G=$($c.G), B=$($c.B)"
}
$bmp.Dispose()
