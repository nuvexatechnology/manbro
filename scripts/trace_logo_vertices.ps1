Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1789999376093.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

# Let's inspect rows and columns to find key vertices
# Let's find:
# 1. Top left peak (x, y)
# 2. Top right peak (x, y)
# 3. Bottom left tip
# 4. Bottom right tip
# 5. Center V bottom of the M
# 6. Center inner top of the M
# 7. Chevron top center, bottom center, left tip, right tip

Write-Output "Searching for key feature points..."

# Let's crop the gold emblem directly to a transparent PNG first!
# For each pixel in [minX - 10, maxX + 10] x [minY - 10, maxY + 10]:
$cropMinX = [Math]::Max(0, 375)
$cropMaxX = [Math]::Min($bmp.Width - 1, 700)
$cropMinY = [Math]::Max(0, 150)
$cropMaxY = [Math]::Min($bmp.Height - 1, 468)
$w = $cropMaxX - $cropMinX + 1
$h = $cropMaxY - $cropMinY + 1

$outBmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $origX = $cropMinX + $x
        $origY = $cropMinY + $y
        $c = $bmp.GetPixel($origX, $origY)
        
        # Color difference from neutral gray:
        # Gray background has R ≈ G ≈ B (max diff < 12)
        # Gold has high (R - B) and (G - B)
        $diffRB = $c.R - $c.B
        $diffGB = $c.G - $c.B
        $saturation = [Math]::Max(0, [Math]::Max($diffRB, $diffGB))
        
        # Also check if it's the dark beveled border of the gold emblem
        # The beveled border has R > B, but darker
        if ($diffRB -gt 15 -and $diffGB -gt 8 -and ($c.R + $c.G) -gt 150) {
            # Gold emblem pixel!
            # Smooth edge with alpha if near boundary
            $alpha = 255
            if ($diffRB -lt 25 -or $diffGB -lt 15) {
                $alpha = [int]([Math]::Min(255, [Math]::Max(0, ($diffRB - 15) * 25.5)))
            }
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
        } else {
            # Fully transparent
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$outPath = 'c:\Users\Niyas\manbro\public\images\logo-gold.png'
$outBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved cropped transparent gold logo to $outPath ($w x $h)"

$outBmp.Dispose()
$bmp.Dispose()
