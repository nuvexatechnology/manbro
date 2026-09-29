Add-Type -AssemblyName System.Drawing
$imgPath = 'c:\Users\Niyas\manbro\public\images\logo-gold.png'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

# Let's inspect:
# Shape 1: Outer M
# Left outer vertical edge: from X ~ 4-7, Y from 6 to bottom left cut
# Let's find bottom-most Y on the left side (X around 4-30):
$leftBottom = @()
for ($x = 0; $x -lt 60; $x++) {
    for ($y = $bmp.Height - 1; $y -ge 0; $y--) {
        if ($bmp.GetPixel($x, $y).A -gt 100) {
            $leftBottom += [PSCustomObject]@{ X = $x; Y = $y }
            break
        }
    }
}
$leftBottomSorted = $leftBottom | Sort-Object -Descending Y
Write-Output "Left bottom points:"
$leftBottomSorted | Select-Object -First 5 | ForEach-Object { Write-Output "  X=$($_.X), Y=$($_.Y)" }

# Let's find right-most bottom points (X around 260-325):
$rightBottom = @()
for ($x = 260; $x -lt $bmp.Width; $x++) {
    for ($y = $bmp.Height - 1; $y -ge 0; $y--) {
        if ($bmp.GetPixel($x, $y).A -gt 100) {
            $rightBottom += [PSCustomObject]@{ X = $x; Y = $y }
            break
        }
    }
}
$rightBottomSorted = $rightBottom | Sort-Object -Descending Y
Write-Output "Right bottom points:"
$rightBottomSorted | Select-Object -First 5 | ForEach-Object { Write-Output "  X=$($_.X), Y=$($_.Y)" }

# Let's find inner left bottom corner of the M (where left leg inner edge meets bottom cut):
# Left leg inner edge: around X = 35 to 45
# Let's inspect the bottom cut of the left leg:
Write-Output "Left leg bottom profile:"
for ($x = 4; $x -le 40; $x += 4) {
    for ($y = $bmp.Height - 1; $y -ge 150; $y--) {
        if ($bmp.GetPixel($x, $y).A -gt 100) {
            Write-Output "  X=$x, lowest Y=$y"
            break
        }
    }
}

# Let's find top cuts of both peaks:
# Peak 1: left peak
Write-Output "Left peak profile (X from 4 to 20):"
for ($x = 4; $x -le 20; $x += 2) {
    for ($y = 0; $y -le 50; $y++) {
        if ($bmp.GetPixel($x, $y).A -gt 100) {
            Write-Output "  X=$x, highest Y=$y"
            break
        }
    }
}

# Peak 2: right peak
Write-Output "Right peak profile (X from 305 to 322):"
for ($x = 305; $x -le 322; $x += 2) {
    for ($y = 0; $y -le 50; $y++) {
        if ($bmp.GetPixel($x, $y).A -gt 100) {
            Write-Output "  X=$x, highest Y=$y"
            break
        }
    }
}

# Let's check chevron (isolated below Y=180, between X=70 and 250):
Write-Output "Chevron profile:"
$chevLeft = @()
$chevRight = @()
for ($y = 180; $y -lt $bmp.Height; $y++) {
    for ($x = 70; $x -le 250; $x++) {
        if ($bmp.GetPixel($x, $y).A -gt 100) {
            $chevLeft += [PSCustomObject]@{ X = $x; Y = $y }
            break
        }
    }
    for ($x = 250; $x -ge 70; $x--) {
        if ($bmp.GetPixel($x, $y).A -gt 100) {
            $chevRight += [PSCustomObject]@{ X = $x; Y = $y }
            break
        }
    }
}
$chevLeftSortedX = $chevLeft | Sort-Object X
Write-Output "Chevron leftmost: X=$($chevLeftSortedX[0].X), Y=$($chevLeftSortedX[0].Y)"
$chevRightSortedX = $chevRight | Sort-Object -Descending X
Write-Output "Chevron rightmost: X=$($chevRightSortedX[0].X), Y=$($chevRightSortedX[0].Y)"
$chevBottomY = $chevLeft | Sort-Object -Descending Y
Write-Output "Chevron bottom tip: X=$($chevBottomY[0].X), Y=$($chevBottomY[0].Y)"

$bmp.Dispose()
