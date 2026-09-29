$bytes = [System.IO.File]::ReadAllBytes("c:\Users\Niyas\manbro\scripts\input.pdf")
$txt = [System.Text.Encoding]::ASCII.GetString($bytes)

$idx = $txt.IndexOf("419 0 obj")
Write-Output "Found 419 0 obj at $idx"
$sub = $txt.Substring($idx, 500)
Write-Output $sub

$streamStart = $txt.IndexOf("stream", $idx) + 6
if ($bytes[$streamStart] -eq 13) { $streamStart++ } # skip \r
if ($bytes[$streamStart] -eq 10) { $streamStart++ } # skip \n

$streamEnd = $txt.IndexOf("endstream", $streamStart)
$streamLen = $streamEnd - $streamStart
Write-Output "Stream length: $streamLen (start: $streamStart, end: $streamEnd)"

$rawBytes = New-Object byte[] $streamLen
[Array]::Copy($bytes, $streamStart, $rawBytes, 0, $streamLen)

# Decompress FlateDecode (skip 2 byte zlib header, skip 4 byte adler32 checksum)
$msIn = New-Object System.IO.MemoryStream($rawBytes, 2, $streamLen - 6)
$ds = New-Object System.IO.Compression.DeflateStream($msIn, [System.IO.Compression.CompressionMode]::Decompress)
$msOut = New-Object System.IO.MemoryStream
$ds.CopyTo($msOut)
$decomp = [System.Text.Encoding]::UTF8.GetString($msOut.ToArray())
Write-Output "Decompressed length: $($decomp.Length)"

[System.IO.File]::WriteAllText("c:\Users\Niyas\manbro\scripts\page_decompressed.txt", $decomp)
Write-Output "Wrote to page_decompressed.txt"
