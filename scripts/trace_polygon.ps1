Add-Type -AssemblyName System.Drawing
$imgPath = 'c:\Users\Niyas\manbro\public\images\logo-gold.png'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

Write-Output "Image size: $($bmp.Width) x $($bmp.Height)"

# Find tight bounding box of non-zero alpha
$minX = $bmp.Width; $maxX = 0; $minY = $bmp.Height; $maxY = 0
for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -gt 30) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Tight logo bounds in 326x319: minX=$minX, maxX=$maxX, minY=$minY, maxY=$maxY"
$w = $maxX - $minX + 1
$h = $maxY - $minY + 1
Write-Output "Tight width=$w, height=$h"

# Let's find:
# 1. Left outer edge: minX at each Y
# 2. Right outer edge: maxX at each Y
# 3. Topmost point: at what X is minY?
# 4. Center V point of the M: lowest Y of the central dip
# 5. Bottom tip of the chevron: maxY

# Find top peaks
$topPeaks = @()
for ($x = $minX; $x -le $maxX; $x++) {
    for ($y = $minY; $y -le $minY + 20; $y++) {
        if ($bmp.GetPixel($x, $y).A -gt 100) {
            $topPeaks += [PSCustomObject]@{ X = $x; Y = $y }
            break
        }
    }
}
$topPeaksSorted = $topPeaks | Sort-Object Y
Write-Output "Topmost points:"
$topPeaksSorted | Select-Object -First 5 | ForEach-Object { Write-Output "  X=$($_.X), Y=$($_.Y)" }

# Find center column (~ ($minX + $maxX)/2)
$midX = [int](($minX + $maxX) / 2)
Write-Output "MidX: $midX"

# In midX column, find all transitions (in/out of shapes)
$transitions = @()
$inShape = $false
for ($y = $minY; $y -le $maxY; $y++) {
    $a = $bmp.GetPixel($midX, $y).A
    if ($a -gt 100 -and -not $inShape) {
        $inShape = $true
        $transitions += "Enter shape at Y=$y"
    } elseif ($a -le 100 -and $inShape) {
        $inShape = $false
        $transitions += "Exit shape at Y=$y"
    }
}
Write-Output "MidX ($midX) vertical scan:"
$transitions | ForEach-Object { Write-Output "  $_" }

$bmp.Dispose()
