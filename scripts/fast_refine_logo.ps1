Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class LogoProcessor {
    public static void Process(string inputPath, string outputPath) {
        using (Bitmap src = (Bitmap)Image.FromFile(inputPath)) {
            // Find gold bounds
            int minX = src.Width, maxX = 0, minY = src.Height, maxY = 0;
            BitmapData srcData = src.LockBits(new Rectangle(0, 0, src.Width, src.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            
            unsafe {
                byte* ptr = (byte*)srcData.Scan0;
                for (int y = 0; y < src.Height; y++) {
                    byte* row = ptr + (y * srcData.Stride);
                    for (int x = 0; x < src.Width; x++) {
                        byte b = row[x * 4];
                        byte g = row[x * 4 + 1];
                        byte r = row[x * 4 + 2];
                        
                        int diffRB = r - b;
                        int diffGB = g - b;
                        if (diffRB >= 30 && diffGB >= 14 && r > 130 && g > 100) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }
            }
            src.UnlockBits(srcData);

            int pad = 8;
            minX = Math.Max(0, minX - pad);
            maxX = Math.Min(src.Width - 1, maxX + pad);
            minY = Math.Max(0, minY - pad);
            maxY = Math.Min(src.Height - 1, maxY + pad);
            int outW = maxX - minX + 1;
            int outH = maxY - minY + 1;

            Bitmap dst = new Bitmap(outW, outH, PixelFormat.Format32bppArgb);
            BitmapData dstData = dst.LockBits(new Rectangle(0, 0, outW, outH), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
            srcData = src.LockBits(new Rectangle(minX, minY, outW, outH), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);

            unsafe {
                byte* sPtr = (byte*)srcData.Scan0;
                byte* dPtr = (byte*)dstData.Scan0;

                for (int y = 0; y < outH; y++) {
                    byte* sRow = sPtr + (y * srcData.Stride);
                    byte* dRow = dPtr + (y * dstData.Stride);

                    for (int x = 0; x < outW; x++) {
                        byte b = sRow[x * 4];
                        byte g = sRow[x * 4 + 1];
                        byte r = sRow[x * 4 + 2];

                        int diffRB = r - b;
                        int diffGB = g - b;

                        if (diffRB >= 30 && diffGB >= 14 && r > 130 && g > 100) {
                            // Gold pixel
                            dRow[x * 4] = b;
                            dRow[x * 4 + 1] = g;
                            dRow[x * 4 + 2] = r;
                            dRow[x * 4 + 3] = 255;
                        } else if (diffRB >= 15 && diffGB >= 8 && r > 120 && g > 95) {
                            // Smooth anti-aliased edge
                            double factor = (diffRB - 15) / 15.0;
                            if (factor > 1.0) factor = 1.0;
                            if (factor < 0.0) factor = 0.0;
                            byte alpha = (byte)(factor * 255);

                            dRow[x * 4] = b;
                            dRow[x * 4 + 1] = g;
                            dRow[x * 4 + 2] = r;
                            dRow[x * 4 + 3] = alpha;
                        } else {
                            // Transparent
                            dRow[x * 4] = 0;
                            dRow[x * 4 + 1] = 0;
                            dRow[x * 4 + 2] = 0;
                            dRow[x * 4 + 3] = 0;
                        }
                    }
                }
            }

            src.UnlockBits(srcData);
            dst.UnlockBits(dstData);

            dst.Save(outputPath, ImageFormat.Png);
            dst.Dispose();
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

$src = 'C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1789999376093.jpg'
$dst = 'c:\Users\Niyas\manbro\public\images\logo.png'
[LogoProcessor]::Process($src, $dst)
Copy-Item $dst 'c:\Users\Niyas\manbro\public\images\logo-gold.png'
Write-Output "Successfully processed and saved logo in milliseconds!"
