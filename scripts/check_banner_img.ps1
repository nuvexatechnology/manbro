Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile("c:\Users\Niyas\manbro\public\images\hero-banner.jpg")
Write-Output "hero-banner.jpg: $($b.Width) x $($b.Height)"
for ($y = 10; $y -lt $b.Height; $y += 30) {
    $c = $b.GetPixel(10, $y)
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
    Write-Output ("Left edge y={0}: {1} (R={2}, G={3}, B={4})" -f $y, $hex, $c.R, $c.G, $c.B)
}
$b.Dispose()
