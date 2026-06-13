$code = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class ImageProcessor {
    public static void ProcessImage(string inPath, string outPath) {
        using (Image img = Image.FromFile(inPath)) {
            // Use a 32-bit ARGB bitmap for transparency
            using (Bitmap result = new Bitmap(img.Width, img.Height, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(result)) {
                    g.DrawImage(img, 0, 0);
                }
                
                Rectangle rect = new Rectangle(0, 0, result.Width, result.Height);
                BitmapData bmpData = result.LockBits(rect, ImageLockMode.ReadWrite, result.PixelFormat);

                int bytes = Math.Abs(bmpData.Stride) * result.Height;
                byte[] rgbValues = new byte[bytes];
                Marshal.Copy(bmpData.Scan0, rgbValues, 0, bytes);

                int bytesPerPixel = 4; // Format32bppArgb

                for (int counter = 0; counter < rgbValues.Length; counter += bytesPerPixel) {
                    byte b = rgbValues[counter];
                    byte gVal = rgbValues[counter + 1];
                    byte r = rgbValues[counter + 2];

                    // Make white/near-white pixels transparent
                    // The AI logo background is usually >= 240 for R, G, B
                    // Using a slightly more aggressive threshold to catch shadows
                    if (r > 240 && gVal > 240 && b > 240) {
                        rgbValues[counter + 3] = 0; // Alpha = 0
                    }
                }

                Marshal.Copy(rgbValues, 0, bmpData.Scan0, bytes);
                result.UnlockBits(bmpData);

                // Save to output path
                result.Save(outPath, ImageFormat.Png);
            }
        }
    }
}
"@

try {
    Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
} catch {
    # Types already added in this session likely
}

$inPath = "C:\Users\Dzaky Dzulfikar\Documents\Tugas Akhir\Coba\frontend\public\logo.png"
$tempPath = "C:\Users\Dzaky Dzulfikar\Documents\Tugas Akhir\Coba\frontend\public\logo_temp.png"

# Check if file exists
if (Test-Path $inPath) {
    [ImageProcessor]::ProcessImage($inPath, $tempPath)
    # Move temp to final
    Move-Item -Path $tempPath -Destination $inPath -Force
    Write-Host "Success: Background removed and saved to logo.png"
} else {
    Write-Host "Error: logo.png not found at $inPath"
}
