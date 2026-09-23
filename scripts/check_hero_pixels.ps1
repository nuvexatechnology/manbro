Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile("c:\Users\Niyas\manbro\public\images\hero-couple-exact.png")
Write-Output "hero-couple-exact.png: $($b.Width) x $($b.Height)"
Write-Output "Left edge pixels (x=0):"
for ($y = 10; $y -lt $b.Height; $y += 60) {
    $c = $b.GetPixel(0, $y)
    Write-Output ("y={0}: A={1}, R={2}, G={3}, B={4} (Hex: #{5:X2}{6:X2}{7:X2})" -f $y, $c.A, $c.R, $c.G, $c.B, $c.R, $c.G, $c.B)
}
$b.Dispose()
