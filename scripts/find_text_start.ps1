Add-Type -AssemblyName System.Drawing
$filePath = "C:\Users\Niyas\.gemini\antigravity-ide\brain\6f4b4922-ffb7-4d44-aa9c-611a632fee06\.user_uploaded\media_1789920540099.png"
$bmp = [System.Drawing.Bitmap]::FromFile($filePath)

$firstTextX = 9999
for ($x = 0; $x -lt 300; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 30 -or $c.G -gt 50 -or $c.B -gt 30) {
            $firstTextX = $x
            Write-Host "Found text/foreground at x = $x , y = $y"
            break
        }
    }
    if ($firstTextX -lt 9999) { break }
}

Write-Host "First foreground pixel is at X = $firstTextX"
$bmp.Dispose()
