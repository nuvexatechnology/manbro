Add-Type -AssemblyName System.Drawing

function SampleImg($path, $name) {
    Write-Output "=== $name ($path) ==="
    $bmp = [System.Drawing.Bitmap]::FromFile($path)
    Write-Output "Dimensions: $($bmp.Width) x $($bmp.Height)"
    
    # Let's find the dominant greens and golds
    $colors = @{}
    for ($y = 0; $y -lt $bmp.Height; $y += 5) {
        for ($x = 0; $x -lt $bmp.Width; $x += 5) {
            $c = $bmp.GetPixel($x, $y)
            $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
            $colors[$hex] = [int]$colors[$hex] + 1
        }
    }
    
    Write-Output "Top 15 most frequent colors:"
    $colors.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 15 | ForEach-Object {
        Write-Output "$($_.Name): $($_.Value) times"
    }
    $bmp.Dispose()
}

SampleImg "C:\Users\Niyas\.gemini\antigravity-ide\brain\6f4b4922-ffb7-4d44-aa9c-611a632fee06\.user_uploaded\media_1789915061888.png" "USER FOOTER SCREENSHOT"
SampleImg "C:\Users\Niyas\.gemini\antigravity-ide\brain\6f4b4922-ffb7-4d44-aa9c-611a632fee06\figma_35_percent_1789917052181.png" "FIGMA CARDS SCREENSHOT"
