Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1790000188982.png'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

Write-Output "Image size: $($bmp.Width) x $($bmp.Height)"

# Sample background color
$bg = $bmp.GetPixel(10, 10)
Write-Output "Background color: R=$($bg.R), G=$($bg.G), B=$($bg.B), Hex=#$($bg.R.ToString('X2'))$($bg.G.ToString('X2'))$($bg.B.ToString('X2'))"

# Sample gold color from the letter M
# Find a gold pixel
$goldColors = @{}
for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # check if gold (R > 150, G > 120, B < 80)
        if ($c.R -gt 150 -and $c.G -gt 120 -and $c.B -lt 100) {
            $hex = "#$($c.R.ToString('X2'))$($c.G.ToString('X2'))$($c.B.ToString('X2'))"
            $goldColors[$hex] = ($goldColors[$hex] + 1)
        }
    }
}

Write-Output "Top gold colors:"
$goldColors.GetEnumerator() | Sort-Object -Descending Value | Select-Object -First 10 | ForEach-Object {
    Write-Output "  $($_.Key): $($_.Value) pixels"
}

# Find bounding box of all gold pixels (the entire logo + text!)
$minX = $bmp.Width; $maxX = 0; $minY = $bmp.Height; $maxY = 0
for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 150 -and $c.G -gt 120 -and $c.B -lt 100) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Logo Lockup Bounds: minX=$minX, maxX=$maxX, minY=$minY, maxY=$maxY"
Write-Output "Width: $($maxX - $minX + 1), Height: $($maxY - $minY + 1)"

$bmp.Dispose()
