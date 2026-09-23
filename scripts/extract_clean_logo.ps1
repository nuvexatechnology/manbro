Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1789999376093.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

# Emblem bounds in original 1024x523:
# minX ~ 379, maxX ~ 695
# minY ~ 158, maxY ~ 461
$cropMinX = 375
$cropMaxX = 699
$cropMinY = 154
$cropMaxY = 465

$w = $cropMaxX - $cropMinX + 1
$h = $cropMaxY - $cropMinY + 1

$outBmp = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $origX = $cropMinX + $x
        $origY = $cropMinY + $y
        $c = $bmp.GetPixel($origX, $origY)
        
        $sat = $c.R - $c.B
        $satG = $c.G - $c.B
        
        if ($sat -gt 12 -and $satG -gt 5) {
            # Compute smooth alpha on edge
            $t = ($sat - 12) / 30.0
            if ($t -gt 1.0) { $t = 1.0 }
            if ($t -lt 0.0) { $t = 0.0 }
            $alpha = [int]($t * 255)
            
            # If near the edge, slightly clean up any desaturated gray bleed
            $r = $c.R
            $g = $c.G
            $b = $c.B
            
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))
        } else {
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

# Save main logo PNG
$outPath = 'c:\Users\Niyas\manbro\public\images\logo.png'
$outBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved clean logo to $outPath ($w x $h)"

$outPathGold = 'c:\Users\Niyas\manbro\public\images\logo-gold.png'
$outBmp.Save($outPathGold, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved clean logo to $outPathGold ($w x $h)"

$outBmp.Dispose()
$bmp.Dispose()
