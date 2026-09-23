Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile("c:\Users\Niyas\manbro\public\images\hero-banner.png")
$w = $src.Width
$h = $src.Height

# Target exact page background #091D12
$targetR = [byte]9   # 0x09
$targetG = [byte]29  # 0x1D
$targetB = [byte]18  # 0x12

$fadeX = 35
$fadeY = 20

$outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$dstData = $outBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$bytesCount = $w * $h * 4
$srcBytes = New-Object byte[] $bytesCount
$dstBytes = New-Object byte[] $bytesCount

[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBytes, 0, $bytesCount)

$csharp = @"
using System;
public class BannerFeatherer {
    public static void FeatherAllEdges(byte[] src, byte[] dst, int w, int h, byte tR, byte tG, byte tB, int fadeX, int fadeY) {
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int idx = (y * w + x) * 4;
                double factor = 1.0;
                
                if (x < fadeX) {
                    double t = (double)x / fadeX;
                    factor = Math.Min(factor, t * t * (3 - 2 * t));
                }
                int rightDist = w - 1 - x;
                if (rightDist < fadeX) {
                    double t = (double)rightDist / fadeX;
                    factor = Math.Min(factor, t * t * (3 - 2 * t));
                }
                if (y < fadeY) {
                    double t = (double)y / fadeY;
                    factor = Math.Min(factor, t * t * (3 - 2 * t));
                }
                int botDist = h - 1 - y;
                if (botDist < fadeY) {
                    double t = (double)botDist / fadeY;
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
[BannerFeatherer]::FeatherAllEdges($srcBytes, $dstBytes, $w, $h, $targetR, $targetG, $targetB, $fadeX, $fadeY)

[System.Runtime.InteropServices.Marshal]::Copy($dstBytes, 0, $dstData.Scan0, $bytesCount)

$src.UnlockBits($srcData)
$outBmp.UnlockBits($dstData)
$src.Dispose()

$outBmp.Save("c:\Users\Niyas\manbro\public\images\hero-banner.png", [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()

Write-Output "Full hero banner feathered seamlessly into #091D12!"
