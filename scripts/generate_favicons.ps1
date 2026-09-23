Add-Type -AssemblyName System.Drawing

$srcPath = 'c:\Users\Niyas\manbro\public\images\logo-mark.png'
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

function Resize-Bitmap($orig, $width, $height) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    
    # Draw scaled preserving square aspect ratio
    $g.DrawImage($orig, 0, 0, $width, $height)
    $g.Dispose()
    return $bmp
}

# 1. Generate PNG sizes
$sizes = @(16, 32, 48, 64, 180, 192, 512)
$pngBytesMap = @{}

foreach ($s in $sizes) {
    $resized = Resize-Bitmap $src $s $s
    $ms = New-Object System.IO.MemoryStream
    $resized.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngBytesMap[$s] = $ms.ToArray()
    $ms.Dispose()
    $resized.Dispose()
}

# Save app/icon.png (32x32 and 192x192)
[System.IO.File]::WriteAllBytes('c:\Users\Niyas\manbro\app\icon.png', $pngBytesMap[32])
[System.IO.File]::WriteAllBytes('c:\Users\Niyas\manbro\public\images\favicon-32x32.png', $pngBytesMap[32])
[System.IO.File]::WriteAllBytes('c:\Users\Niyas\manbro\public\images\favicon-16x16.png', $pngBytesMap[16])
[System.IO.File]::WriteAllBytes('c:\Users\Niyas\manbro\app\apple-icon.png', $pngBytesMap[180])

# 2. Build multi-size .ico (16, 32, 48, 64) with embedded PNGs
$icoSizes = @(16, 32, 48, 64)
$icoStream = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $icoStream

# Header
$bw.Write([uint16]0)                # Reserved
$bw.Write([uint16]1)                # Type 1 = Icon
$bw.Write([uint16]$icoSizes.Count)  # Image count

# Calculate initial offset for image data:
# 6 bytes header + (16 bytes * count)
$offset = 6 + (16 * $icoSizes.Count)

foreach ($s in $icoSizes) {
    $bytes = $pngBytesMap[$s]
    $wByte = if ($s -ge 256) { [byte]0 } else { [byte]$s }
    $hByte = if ($s -ge 256) { [byte]0 } else { [byte]$s }
    
    $bw.Write($wByte)               # Width
    $bw.Write($hByte)               # Height
    $bw.Write([byte]0)              # Color count
    $bw.Write([byte]0)              # Reserved
    $bw.Write([uint16]1)            # Color planes
    $bw.Write([uint16]32)           # Bits per pixel
    $bw.Write([uint32]$bytes.Length)# Image size in bytes
    $bw.Write([uint32]$offset)      # Offset
    
    $offset += $bytes.Length
}

# Write PNG payloads
foreach ($s in $icoSizes) {
    $bytes = $pngBytesMap[$s]
    $bw.Write($bytes)
}

$bw.Flush()
$icoBytes = $icoStream.ToArray()
$bw.Dispose()
$icoStream.Dispose()

# Save favicon.ico to both app/ and public/
[System.IO.File]::WriteAllBytes('c:\Users\Niyas\manbro\app\favicon.ico', $icoBytes)
[System.IO.File]::WriteAllBytes('c:\Users\Niyas\manbro\public\favicon.ico', $icoBytes)

Write-Output "Successfully generated MANBRO favicons:"
Write-Output "  app/favicon.ico ($($icoBytes.Length) bytes)"
Write-Output "  public/favicon.ico ($($icoBytes.Length) bytes)"
Write-Output "  app/icon.png (32x32)"
Write-Output "  app/apple-icon.png (180x180)"
Write-Output "  public/images/favicon-32x32.png"
Write-Output "  public/images/favicon-16x16.png"

$src.Dispose()
