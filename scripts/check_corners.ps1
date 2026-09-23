Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile("c:\Users\Niyas\manbro\public\images\hero-banner.png")

Write-Output "hero-banner.png dimensions: $($b.Width) x $($b.Height)"
Write-Output "Top-left pixel: $( $c = $b.GetPixel(0,0); '#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B )"
Write-Output "Bottom-left pixel: $( $c = $b.GetPixel(0, $b.Height-1); '#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B )"
Write-Output "Top-right pixel: $( $c = $b.GetPixel($b.Width-1, 0); '#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B )"
Write-Output "Bottom-right pixel: $( $c = $b.GetPixel($b.Width-1, $b.Height-1); '#{0:X2}{1:X2}{2:X2}' -f $c.R, $c.G, $c.B )"

$b.Dispose()
