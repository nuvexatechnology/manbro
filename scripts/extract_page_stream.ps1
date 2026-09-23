$bytes = [System.IO.File]::ReadAllBytes("c:\Users\Niyas\manbro\scripts\input.pdf")
$txt = [System.Text.Encoding]::ASCII.GetString($bytes)

$pageMatch = [regex]::Match($txt, '/Type\s*/Page\b[^>]*?>>')
Write-Output "Page object:"
Write-Output $pageMatch.Value

# Find Contents reference
$contentsMatch = [regex]::Match($pageMatch.Value, '/Contents\s+(\d+)\s+(\d+)\s+R')
if ($contentsMatch.Success) {
    $objNum = $contentsMatch.Groups[1].Value
    $genNum = $contentsMatch.Groups[2].Value
    Write-Output "Contents is object $objNum $genNum R"
    
    # Find that object in the PDF
    $objHeader = [regex]::Match($txt, "(?s)$objNum\s+$genNum\s+obj\s*<<(.*?)>>\s*stream\r?\n(.*?)\r?\nendstream")
    if ($objHeader.Success) {
        $streamDict = $objHeader.Groups[1].Value
        Write-Output "Stream Dict: $streamDict"
        $streamIdx = $objHeader.Groups[2].Index
        $streamLen = $objHeader.Groups[2].Length
        Write-Output "Stream raw length: $streamLen"
        
        # Decompress stream
        $rawBytes = New-Object byte[] $streamLen
        [Array]::Copy($bytes, $streamIdx, $rawBytes, 0, $streamLen)
        
        # Try DeflateStream with zlib header skip (2 bytes)
        try {
            $msIn = New-Object System.IO.MemoryStream($rawBytes, 2, $streamLen - 6)
            $ds = New-Object System.IO.Compression.DeflateStream($msIn, [System.IO.Compression.CompressionMode]::Decompress)
            $msOut = New-Object System.IO.MemoryStream
            $ds.CopyTo($msOut)
            $decomp = [System.Text.Encoding]::UTF8.GetString($msOut.ToArray())
            Write-Output "`nDecompressed Page Stream Length: $($decomp.Length)"
            [System.IO.File]::WriteAllText("c:\Users\Niyas\manbro\scripts\page_stream.txt", $decomp)
            Write-Output "Saved to page_stream.txt"
        } catch {
            Write-Output "Decompress error: $_"
        }
    }
}
