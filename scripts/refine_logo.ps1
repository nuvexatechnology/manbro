Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1789999376093.jpg'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

# First pass: identify gold mask
# Gold emblem has R > 130, G > 105, (R - B) >= 30, (G - B) >= 15
$goldMap = New-Object 'bool[,]' $bmp.Width, $bmp.Height

$minX = $bmp.Width; $maxX = 0; $minY = $bmp.Height; $maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        $diffRB = $c.R - $c.B
        $diffGB = $c.G - $c.B
        
        # Exact gold emblem pixel (including the dark metallic border)
        if ($diffRB -ge 30 -and $diffGB -ge 14 -and $c.R -gt 130 -and $c.G -gt 100) {
            $goldMap[$x, $y] = $true
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Output "Tight gold bounds: X=[$minX, $maxX], Y=[$minY, $maxY]"
$pad = 6
$outMinX = [Math]::Max(0, $minX - $pad)
$outMaxX = [Math]::Min($bmp.Width - 1, $maxX + $pad)
$outMinY = [Math]::Max(0, $minY - $pad)
$outMaxY = [Math]::Min($bmp.Height - 1, $maxY + $pad)

$outW = $outMaxX - $outMinX + 1
$outH = $outMaxY - $outMinY + 1

$outBmp = New-Object System.Drawing.Bitmap $outW, $outH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $outH; $y++) {
    for ($x = 0; $x -lt $outW; $x++) {
        $srcX = $outMinX + $x
        $srcY = $outMinY + $y
        
        $c = $bmp.GetPixel($srcX, $srcY)
        $diffRB = $c.R - $c.B
        $diffGB = $c.G - $c.B
        
        if ($goldMap[$srcX, $srcY]) {
            # Inside gold emblem: check if near border for anti-aliasing
            # Count how many of 8 neighbors are outside
            $outsideCount = 0
            for ($dy = -1; $dy -le 1; $dy++) {
                for ($dx = -1; $dx -le 1; $dx++) {
                    if ($dx -eq 0 -and $dy -eq 0) { continue }
                    $nx = $srcX + $dx
                    $ny = $srcY + $dy
                    if ($nx -ge 0 -and $nx -lt $bmp.Width -and $ny -ge 0 -and $ny -lt $bmp.Height) {
                        if (-not $goldMap[$nx, $ny]) { $outsideCount++ }
                    }
                }
            }
            
            $alpha = 255
            if ($outsideCount -ge 5) {
                $alpha = 180
            } elseif ($outsideCount -ge 3) {
                $alpha = 220
            }
            
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
        } else {
            # Check if immediately adjacent to a gold pixel (sub-pixel anti-aliasing)
            $goldNeighborCount = 0
            $sumR = 0; $sumG = 0; $sumB = 0
            for ($dy = -1; $dy -le 1; $dy++) {
                for ($dx = -1; $dx -le 1; $dx++) {
                    if ($dx -eq 0 -and $dy -eq 0) { continue }
                    $nx = $srcX + $dx
                    $ny = $srcY + $dy
                    if ($nx -ge 0 -and $nx -lt $bmp.Width -and $ny -ge 0 -and $ny -lt $bmp.Height) {
                        if ($goldMap[$nx, $ny]) {
                            $goldNeighborCount++
                            $nc = $bmp.GetPixel($nx, $ny)
                            $sumR += $nc.R; $sumG += $nc.G; $sumB += $nc.B
                        }
                    }
                }
            }
            
            if ($goldNeighborCount -ge 3 -and $diffRB -ge 18) {
                # Edge blending pixel with recovered gold tone
                $alpha = [int]([Math]::Min(140, $goldNeighborCount * 25))
                $avgR = [int]($sumR / $goldNeighborCount)
                $avgG = [int]($sumG / $goldNeighborCount)
                $avgB = [int]($sumB / $goldNeighborCount)
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $avgR, $avgG, $avgB))
            } else {
                $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
}

$outPath = 'c:\Users\Niyas\manbro\public\images\logo.png'
$outBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$outPathGold = 'c:\Users\Niyas\manbro\public\images\logo-gold.png'
$outBmp.Save($outPathGold, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Perfected transparent logo saved to $outPath ($outW x $outH)"

$outBmp.Dispose()
$bmp.Dispose()
