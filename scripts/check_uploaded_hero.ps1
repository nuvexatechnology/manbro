Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1789992964453.png"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

Write-Output "Uploaded Hero Banner Dimensions: $($bmp.Width) x $($bmp.Height)"

# Sample background on the far left (x=10)
Write-Output "`nBackground samples along x=10:"
for ($y = 20; $y -lt $bmp.Height; $y += 30) {
    $c = $bmp.GetPixel(10, $y)
    Write-Output ("y={0}: #{1:X2}{2:X2}{3:X2} (R={1}, G={2}, B={3})" -f $y, $c.R, $c.G, $c.B)
}

# Let's find the button color: look around x=100-150, y=250-320
Write-Output "`nSampling button area:"
for ($y = 250; $y -le 300; $y += 10) {
    for ($x = 70; $x -le 160; $x += 20) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 150 -and $c.G -gt 100) {
            Write-Output ("Button pixel at ({0},{1}): #{2:X2}{3:X2}{4:X2}" -f $x, $y, $c.R, $c.G, $c.B)
        }
    }
}

# Copy to public/images/
$destPath = "c:\Users\Niyas\manbro\public\images\hero-exact-uploaded.png"
$bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "Copied to public\images\hero-exact-uploaded.png successfully!"
