Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile("c:\Users\Niyas\manbro\public\images\hero-couple-exact.png")
$w = $src.Width
$h = $src.Height

# Target exact PDF background #091D12
$targetR = [byte]9   # 0x09
$targetG = [byte]29  # 0x1D
$targetB = [byte]18  # 0x12

$fadeLeftW = 75
$fadeBotH = 25
$fadeTopH = 20

$outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Lock bits for fast processing
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dstData = $outBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$bytesCount = $w * $h * 4
$srcBytes = New-Object byte[] $bytesCount
$dstBytes = New-Object byte[] $bytesCount

[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBytes, 0, $bytesCount)

$csharp = @"
using System;
public class FeatherEngine {
    public static void Feather(byte[] src, byte[] dst, int w, int h, byte tR, byte tG, byte tB, int fadeL, int fadeB, int fadeT) {
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int idx = (y * w + x) * 4;
                double factor = 1.0;
                
                if (x < fadeL) {
                    double t = (double)x / fadeL;
                    factor = Math.Min(factor, t * t * (3 - 2 * t));
                }
                int botDist = h - 1 - y;
                if (botDist < fadeB) {
                    double t = (double)botDist / fadeB;
                    factor = Math.Min(factor, t * t * (3 - 2 * t));
                }
                if (y < fadeT) {
                    double t = (double)y / fadeT;
                    factor = Math.Min(factor, t * t * (3 - 2 * t));
                }
                
                byte b = src[idx];
                byte g = src[idx + 1];
                byte r = src[idx + 2];
                byte a = src[idx + 3];
                
                dst[idx]     = (byte)Math.Round(tB * (1.0 - factor) + b * factor);
                dst[idx + 1] = (byte)Math.Round(tG * (1.0 - factor) + g * factor);
                dst[idx + 2] = (byte)Math.Round(tR * (1.0 - factor) + r * factor);
                dst[idx + 3] = a;
            }
        }
    }
}
"@
Add-Type -TypeDefinition $csharp -Language CSharp
[FeatherEngine]::Feather($srcBytes, $dstBytes, $w, $h, $targetR, $targetG, $targetB, $fadeLeftW, $fadeBotH, $fadeTopH)

[System.Runtime.InteropServices.Marshal]::Copy($dstBytes, 0, $dstData.Scan0, $bytesCount)

$src.UnlockBits($srcData)
$outBmp.UnlockBits($dstData)
$src.Dispose()

$outBmp.Save("c:\Users\Niyas\manbro\public\images\hero-couple-exact.png", [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()

Write-Output "Feathered hero-couple-exact.png seamlessly into #091D12!"
