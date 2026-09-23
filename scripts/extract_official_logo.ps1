Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class OfficialLogoExtractor {
    public static void Extract(string srcPath, string outFullPath, string outMarkPath, string outTextPath) {
        using (Bitmap src = (Bitmap)Image.FromFile(srcPath)) {
            int fullMinX = 36, fullMaxX = 973, fullMinY = 74, fullMaxY = 219;
            int markMinX = 36, markMaxX = 182;
            int textMinX = 228, textMaxX = 973;

            SaveCropped(src, fullMinX, fullMaxX, fullMinY, fullMaxY, outFullPath);
            SaveCropped(src, markMinX, markMaxX, fullMinY, fullMaxY, outMarkPath);
            SaveCropped(src, textMinX, textMaxX, fullMinY, fullMaxY, outTextPath);
        }
    }

    private static void SaveCropped(Bitmap src, int minX, int maxX, int minY, int maxY, string outPath) {
        int w = maxX - minX + 1;
        int h = maxY - minY + 1;

        using (Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
            BitmapData sData = src.LockBits(new Rectangle(minX, minY, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            BitmapData dData = dst.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

            int srcBytes = Math.Abs(sData.Stride) * h;
            int dstBytes = Math.Abs(dData.Stride) * h;
            byte[] sBuf = new byte[srcBytes];
            byte[] dBuf = new byte[dstBytes];

            Marshal.Copy(sData.Scan0, sBuf, 0, srcBytes);

            for (int y = 0; y < h; y++) {
                int sRowOffset = y * sData.Stride;
                int dRowOffset = y * dData.Stride;

                for (int x = 0; x < w; x++) {
                    int sIdx = sRowOffset + (x * 4);
                    int dIdx = dRowOffset + (x * 4);

                    byte b = sBuf[sIdx];
                    byte g = sBuf[sIdx + 1];
                    byte r = sBuf[sIdx + 2];

                    int diffR = r - 8;
                    int diffG = g - 28;

                    double alphaR = diffR / 204.0;
                    double alphaG = diffG / 147.0;
                    double alpha = Math.Max(alphaR, alphaG);

                    if (alpha <= 0.04) {
                        dBuf[dIdx] = 0;
                        dBuf[dIdx + 1] = 0;
                        dBuf[dIdx + 2] = 0;
                        dBuf[dIdx + 3] = 0;
                    } else if (alpha >= 0.96) {
                        dBuf[dIdx] = 54;
                        dBuf[dIdx + 1] = 175;
                        dBuf[dIdx + 2] = 212;
                        dBuf[dIdx + 3] = 255;
                    } else {
                        byte a = (byte)(Math.Min(1.0, alpha) * 255);
                        dBuf[dIdx] = 54;
                        dBuf[dIdx + 1] = 175;
                        dBuf[dIdx + 2] = 212;
                        dBuf[dIdx + 3] = a;
                    }
                }
            }

            Marshal.Copy(dBuf, 0, dData.Scan0, dstBytes);

            src.UnlockBits(sData);
            dst.UnlockBits(dData);

            dst.Save(outPath, ImageFormat.Png);
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

$src = 'C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1790000188982.png'
$outFull = 'c:\Users\Niyas\manbro\public\images\logo-full.png'
$outMark = 'c:\Users\Niyas\manbro\public\images\logo-mark.png'
$outText = 'c:\Users\Niyas\manbro\public\images\logo-text.png'

[OfficialLogoExtractor]::Extract($src, $outFull, $outMark, $outText)

Copy-Item $outFull 'c:\Users\Niyas\manbro\public\images\logo.png' -Force

Write-Output "Successfully generated transparent official logo files:"
Write-Output "  1. $outFull"
Write-Output "  2. $outMark"
Write-Output "  3. $outText"
