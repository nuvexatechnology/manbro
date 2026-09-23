$pdfPath = "C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1789988515958.pdf"
$bytes = [System.IO.File]::ReadAllBytes($pdfPath)

# Find all streams in the PDF
$text = [System.Text.Encoding]::ASCII.GetString($bytes)
$streamMatches = [regex]::Matches($text, '(?s)/Filter\s*/FlateDecode.*?stream\r?\n(.*?)\r?\nendstream')

Write-Output "Found $($streamMatches.Count) FlateDecode streams"

$allRg = @{}
$allHex = @{}

foreach ($match in $streamMatches) {
    $streamIdx = [int]$match.Groups[1].Index
    $streamLen = [int]$match.Groups[1].Length
    
    # Extract bytes for this stream
    $streamBytes = New-Object byte[] $streamLen
    [Array]::Copy($bytes, $streamIdx, $streamBytes, 0, $streamLen)
    
    # Decompress using zlib / Deflate
    # Note: PDF Flate streams typically have a 2-byte zlib header (0x78 0x9c or 0x78 0x01 etc)
    try {
        $ms = New-Object System.IO.MemoryStream
        $len = [int]($streamLen - 6)
        if ($len -le 0) { continue }
        $msIn = New-Object System.IO.MemoryStream($streamBytes, 2, $len)
        $ds = New-Object System.IO.Compression.DeflateStream($msIn, [System.IO.Compression.CompressionMode]::Decompress)
        $ds.CopyTo($ms)
        $ds.Dispose()
        $decompressed = [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
        $ms.Dispose()
        $msIn.Dispose()
        
        # Look for RGB operators
        $rg = [regex]::Matches($decompressed, '(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(?:rg|RG)')
        foreach ($m in $rg) {
            $r = [Math]::Round([double]$m.Groups[1].Value * 255)
            $g = [Math]::Round([double]$m.Groups[2].Value * 255)
            $b = [Math]::Round([double]$m.Groups[3].Value * 255)
            $hex = "#{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
            $allRg[$hex] = "R=$r, G=$g, B=$b"
        }
        
        # Look for hex color strings
        $hx = [regex]::Matches($decompressed, '(?i)#([0-9a-f]{6})\b')
        foreach ($m in $hx) {
            $allHex[$m.Value.ToUpper()] = $true
        }
    } catch {
        if ($null -eq $global:firstErr) { $global:firstErr = $_; Write-Output "Error: $_" }
    }
}

Write-Output "`nUnique RGB Colors found in PDF vectors:"
$allRg.GetEnumerator() | Sort-Object Name | ForEach-Object {
    Write-Output "$($_.Name) -> $($_.Value)"
}

Write-Output "`nUnique Hex strings found in PDF text:"
$allHex.Keys | Sort-Object | ForEach-Object {
    Write-Output $_
}
