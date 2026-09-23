Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1790000188982.png'
$bmp = [System.Drawing.Bitmap]::FromFile($imgPath)

# Let's inspect background variation
$bgR = $bmp.GetPixel(0, 0).R
$bgG = $bmp.GetPixel(0, 0).G
$bgB = $bmp.GetPixel(0, 0).B
Write-Output "Corner (0,0): R=$bgR, G=$bgG, B=$bgB"

# Let's check if any background pixel differs by more than 2
$maxDiff = 0
for ($x = 0; $x -lt 30; $x++) {
    for ($y = 0; $y -lt 30; $y++) {
        $c = $bmp.GetPixel($x, $y)
        $diff = [Math]::Abs($c.R - $bgR) + [Math]::Abs($c.G - $bgG) + [Math]::Abs($c.B - $bgB)
        if ($diff -gt $maxDiff) { $maxDiff = $diff }
    }
}
Write-Output "Max background variation in corner: $maxDiff"

# Find division between emblem and text
# Scan columns between X=170 and 260 to find where gold pixels disappear
$colGoldCount = @{}
for ($x = 160; $x -le 260; $x++) {
    $count = 0
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 150 -and $c.G -gt 120) { $count++ }
    }
    $colGoldCount[$x] = $count
}

Write-Output "Column gold counts between emblem and wordmark:"
$colGoldCount.GetEnumerator() | Sort-Object Key | Where-Object { $_.Value -eq 0 } | ForEach-Object {
    Write-Output "  X=$($_.Key): 0 gold pixels"
}

$bmp.Dispose()
