Add-Type -AssemblyName System.Drawing
$pdfImage = "C:\Users\Niyas\.gemini\antigravity-ide\brain\6f4b4922-ffb7-4d44-aa9c-611a632fee06\.tempmediaStorage\media_1789926155454.png"
$bmp = [System.Drawing.Bitmap]::FromFile($pdfImage)

$msg = "PDF Raster Dimensions: {0} x {1}" -f $bmp.Width, $bmp.Height
Write-Output $msg

function Hex($c) {
    return ("#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B)
}

# Scan every 5% of height along the left margin (x=20)
Write-Output "`nBackground samples down the left side (x=20):"
for ($pct = 1; $pct -le 99; $pct += 4) {
    $y = [int]($bmp.Height * $pct / 100)
    $c = $bmp.GetPixel(20, $y)
    $out = "{0}% (y={1}): {2} (R={3} G={4} B={5})" -f $pct, $y, (Hex $c), $c.R, $c.G, $c.B
    Write-Output $out
}

$bmp.Dispose()
