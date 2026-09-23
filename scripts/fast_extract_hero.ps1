$csharp = @"
using System;
public class FastPixelConverter {
    public static void ConvertRgbWithMask(byte[] rgb, byte[] mask, byte[] argb, int totalPixels) {
        bool hasMask = (mask != null && mask.Length == totalPixels);
        for (int i = 0; i < totalPixels; i++) {
            int src = i * 3;
            int dst = i * 4;
            argb[dst]     = rgb[src + 2]; // B
            argb[dst + 1] = rgb[src + 1]; // G
            argb[dst + 2] = rgb[src];     // R
            argb[dst + 3] = hasMask ? mask[i] : (byte)255; // A
        }
    }
}
"@
Add-Type -TypeDefinition $csharp -Language CSharp
Add-Type -AssemblyName System.Drawing

$bytes = [System.IO.File]::ReadAllBytes("c:\Users\Niyas\manbro\scripts\input.pdf")
$txt = [System.Text.Encoding]::ASCII.GetString($bytes)

function ExtractStream($objId) {
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
    
    return @{ Width=$w; Height=$h; Pixels=$pixBytes }
}

$hero = ExtractStream 405
$mask = ExtractStream 406

$totalPixels = $hero.Width * $hero.Height
$argb = New-Object byte[] ($totalPixels * 4)

[FastPixelConverter]::ConvertRgbWithMask($hero.Pixels, $mask.Pixels, $argb, $totalPixels)

$bmp = New-Object System.Drawing.Bitmap($hero.Width, $hero.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$rect = New-Object System.Drawing.Rectangle(0, 0, $hero.Width, $hero.Height)
$bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
[System.Runtime.InteropServices.Marshal]::Copy($argb, 0, $bmpData.Scan0, $argb.Length)
$bmp.UnlockBits($bmpData)

# Save exact banner
$bmp.Save("c:\Users\Niyas\manbro\public\images\hero-banner.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Couple cutout (right ~55%)
$coupleStartX = [int]($hero.Width * 0.42)
$coupleW = $hero.Width - $coupleStartX
$coupleBmp = New-Object System.Drawing.Bitmap($coupleW, $hero.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$cgfx = [System.Drawing.Graphics]::FromImage($coupleBmp)
$cgfx.DrawImage($bmp, 0, 0, (New-Object System.Drawing.Rectangle($coupleStartX, 0, $coupleW, $hero.Height)), [System.Drawing.GraphicsUnit]::Pixel)
$cgfx.Dispose()

$coupleBmp.Save("c:\Users\Niyas\manbro\public\images\hero-couple-exact.png", [System.Drawing.Imaging.ImageFormat]::Png)
$coupleBmp.Dispose()
$bmp.Dispose()

Write-Output "FAST CONVERSION SUCCESS! hero-couple-exact.png saved!"
