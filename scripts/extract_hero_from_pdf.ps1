$bytes = [System.IO.File]::ReadAllBytes("c:\Users\Niyas\manbro\scripts\input.pdf")
$txt = [System.Text.Encoding]::ASCII.GetString($bytes)

function ExtractImage($objId, $outPath) {
    $idx = $txt.IndexOf("$objId 0 obj")
    $dictEnd = $txt.IndexOf("stream", $idx)
    $header = $txt.Substring($idx, $dictEnd - $idx)
    
    $wMatch = [regex]::Match($header, '/Width\s+(\d+)')
    $hMatch = [regex]::Match($header, '/Height\s+(\d+)')
    $w = [int]$wMatch.Groups[1].Value
    $h = [int]$hMatch.Groups[1].Value
    
    $streamStart = $dictEnd + 6
    if ($bytes[$streamStart] -eq 13) { $streamStart++ }
    if ($bytes[$streamStart] -eq 10) { $streamStart++ }
    
    $streamEnd = $txt.IndexOf("endstream", $streamStart)
    $streamLen = [int]($streamEnd - $streamStart)
    
    $rawBytes = New-Object byte[] $streamLen
    [Array]::Copy($bytes, $streamStart, $rawBytes, 0, $streamLen)
    
    $len = [int]($streamLen - 6)
    $msIn = New-Object System.IO.MemoryStream($rawBytes, 2, $len)
    $ds = New-Object System.IO.Compression.DeflateStream($msIn, [System.IO.Compression.CompressionMode]::Decompress)
    $msOut = New-Object System.IO.MemoryStream
    $ds.CopyTo($msOut)
    $pixBytes = $msOut.ToArray()
    
    Write-Output "Extracted $objId 0 obj: $w x $h, Pixel bytes: $($pixBytes.Length)"
    return @{ Width=$w; Height=$h; Pixels=$pixBytes; Header=$header }
}

$hero = ExtractImage 405
$mask = ExtractImage 406

# Create 32-bpp ARGB bitmap
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap($hero.Width, $hero.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Lock bits for fast transfer
$rect = New-Object System.Drawing.Rectangle(0, 0, $hero.Width, $hero.Height)
$bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$totalPixels = $hero.Width * $hero.Height
$argb = New-Object byte[] ($totalPixels * 4)

$hasMask = ($mask.Pixels.Length -eq $totalPixels)
Write-Output "Has mask: $hasMask"

for ($i = 0; $i -lt $totalPixels; $i++) {
    $srcIdx = $i * 3
    $destIdx = $i * 4
    
    $r = $hero.Pixels[$srcIdx]
    $g = $hero.Pixels[$srcIdx + 1]
    $b = $hero.Pixels[$srcIdx + 2]
    $a = 255
    if ($hasMask) {
        $a = $mask.Pixels[$i]
    }
    
    $argb[$destIdx] = $b     # Blue
    $argb[$destIdx + 1] = $g # Green
    $argb[$destIdx + 2] = $r # Red
    $argb[$destIdx + 3] = $a # Alpha
}

[System.Runtime.InteropServices.Marshal]::Copy($argb, 0, $bmpData.Scan0, $argb.Length)
$bmp.UnlockBits($bmpData)

$outPath = "c:\Users\Niyas\manbro\public\images\hero-banner-exact-pdf.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Saved exact PDF hero banner to $outPath successfully!"

# Also create the right-side couple cutout version for responsive layout
$coupleStartX = [int]($hero.Width * 0.40)
$coupleW = $hero.Width - $coupleStartX
$coupleBmp = New-Object System.Drawing.Bitmap($coupleW, $hero.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$cgfx = [System.Drawing.Graphics]::FromImage($coupleBmp)
$cgfx.DrawImage($bmp, 0, 0, (New-Object System.Drawing.Rectangle($coupleStartX, 0, $coupleW, $hero.Height)), [System.Drawing.GraphicsUnit]::Pixel)
$cgfx.Dispose()
$coupleBmp.Save("c:\Users\Niyas\manbro\public\images\hero-couple-exact.png", [System.Drawing.Imaging.ImageFormat]::Png)
$coupleBmp.Dispose()
Write-Output "Saved exact couple cutout to public\images\hero-couple-exact.png!"

$bmp.Dispose()
