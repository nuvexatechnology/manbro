Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Niyas\.gemini\antigravity-ide\brain\6f4b4922-ffb7-4d44-aa9c-611a632fee06\.user_uploaded\media_1789920540099.png"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$targetR = [byte]3   # 0x03
$targetG = [byte]44  # 0x2C
$targetB = [byte]15  # 0x0F

# 1. Clean couple cutout starting at x = 485 (past "OUT.")
$coupleStartX = 485
$coupleWidth = $src.Width - $coupleStartX
$coupleHeight = $src.Height
$coupleBmp = New-Object System.Drawing.Bitmap($coupleWidth, $coupleHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Fade left 55 pixels (x=0 to 55 in coupleBmp, which is 485 to 540 in src)
$fadeLeftW = 55

for ($y = 0; $y -lt $coupleHeight; $y++) {
    for ($x = 0; $x -lt $coupleWidth; $x++) {
        $origX = $x + $coupleStartX
        $c = $src.GetPixel($origX, $y)
        
        $factor = 1.0
        if ($x -lt $fadeLeftW) {
            $t = $x / [double]$fadeLeftW
            $factor = [Math]::Min($factor, (3 * $t * $t - 2 * $t * $t * $t))
        }
        $rightDist = $coupleWidth - 1 - $x
        if ($rightDist -lt 25) {
            $t = $rightDist / 25.0
            $factor = [Math]::Min($factor, (3 * $t * $t - 2 * $t * $t * $t))
        }
        if ($y -lt 15) {
            $t = $y / 15.0
            $factor = [Math]::Min($factor, (3 * $t * $t - 2 * $t * $t * $t))
        }
        $bottomDist = $coupleHeight - 1 - $y
        if ($bottomDist -lt 15) {
            $t = $bottomDist / 15.0
            $factor = [Math]::Min($factor, (3 * $t * $t - 2 * $t * $t * $t))
        }
        
        $r = [byte][Math]::Round($targetR * (1.0 - $factor) + $c.R * $factor)
        $g = [byte][Math]::Round($targetG * (1.0 - $factor) + $c.G * $factor)
        $b = [byte][Math]::Round($targetB * (1.0 - $factor) + $c.B * $factor)
        
        $coupleBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
    }
}
$coupleBmp.Save("c:\Users\Niyas\manbro\public\images\hero-couple-exact.png", [System.Drawing.Imaging.ImageFormat]::Png)
$coupleBmp.Dispose()
Write-Host "hero-couple-exact.png regenerated."

# 2. Perfect full banner (1920 x 685)
$bannerW = 1920
$bannerH = 685
$bannerBmp = New-Object System.Drawing.Bitmap($bannerW, $bannerH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gfx = [System.Drawing.Graphics]::FromImage($bannerBmp)
$gfx.Clear([System.Drawing.Color]::FromArgb(255, $targetR, $targetG, $targetB))

# Calculate aspect ratio
$scale = [double]$bannerH / [double]$src.Height # 685 / 365 = 1.8767
$scaledW = [int][Math]::Round($src.Width * $scale) # 1024 * 1.8767 = 1922
$offsetX = [int][Math]::Round(($bannerW - $scaledW) / 2.0)

$gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gfx.DrawImage($src, $offsetX, 0, $scaledW, $bannerH)
$gfx.Dispose()

# Feather all 4 outer edges of the 1920x685 canvas so it blends 100% into #032C0F
$fadeEdge = 80
for ($y = 0; $y -lt $bannerH; $y++) {
    for ($x = 0; $x -lt $bannerW; $x++) {
        $factor = 1.0
        
        # Left edge
        if ($x -lt $fadeEdge) {
            $t = $x / [double]$fadeEdge
            $factor = [Math]::Min($factor, (3 * $t * $t - 2 * $t * $t * $t))
        }
        # Right edge
        $rightD = $bannerW - 1 - $x
        if ($rightD -lt $fadeEdge) {
            $t = $rightD / [double]$fadeEdge
            $factor = [Math]::Min($factor, (3 * $t * $t - 2 * $t * $t * $t))
        }
        # Top edge
        if ($y -lt 30) {
            $t = $y / 30.0
            $factor = [Math]::Min($factor, (3 * $t * $t - 2 * $t * $t * $t))
        }
        # Bottom edge
        $botD = $bannerH - 1 - $y
        if ($botD -lt 30) {
            $t = $botD / 30.0
            $factor = [Math]::Min($factor, (3 * $t * $t - 2 * $t * $t * $t))
        }
        
        if ($factor -lt 1.0) {
            $currC = $bannerBmp.GetPixel($x, $y)
            $r = [byte][Math]::Round($targetR * (1.0 - $factor) + $currC.R * $factor)
            $g = [byte][Math]::Round($targetG * (1.0 - $factor) + $currC.G * $factor)
            $b = [byte][Math]::Round($targetB * (1.0 - $factor) + $currC.B * $factor)
            $bannerBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
        }
    }
}

$bannerBmp.Save("c:\Users\Niyas\manbro\public\images\hero-banner-seamless.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bannerBmp.Dispose()
$src.Dispose()
Write-Host "hero-banner-seamless.png regenerated."
