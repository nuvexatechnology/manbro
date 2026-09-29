$bytes = [System.IO.File]::ReadAllBytes("c:\Users\Niyas\manbro\scripts\input.pdf")
$txt = [System.Text.Encoding]::ASCII.GetString($bytes)

$idx = $txt.IndexOf("5 0 obj")
Write-Output "Found 5 0 obj at $idx"
$streamStart = $txt.IndexOf("stream", $idx) + 6
if ($bytes[$streamStart] -eq 13) { $streamStart++ }
if ($bytes[$streamStart] -eq 10) { $streamStart++ }

$streamEnd = $txt.IndexOf("endstream", $streamStart)
$streamLen = [int]($streamEnd - $streamStart)
Write-Output "Stream length: $streamLen (start: $streamStart, end: $streamEnd)"

$rawBytes = New-Object byte[] $streamLen
[Array]::Copy($bytes, $streamStart, $rawBytes, 0, $streamLen)

$len = [int]($streamLen - 6)
$msIn = New-Object System.IO.MemoryStream($rawBytes, 2, $len)
$ds = New-Object System.IO.Compression.DeflateStream($msIn, [System.IO.Compression.CompressionMode]::Decompress)
$msOut = New-Object System.IO.MemoryStream
$ds.CopyTo($msOut)
$decomp = [System.Text.Encoding]::UTF8.GetString($msOut.ToArray())
Write-Output "Decompressed length: $($decomp.Length)"

[System.IO.File]::WriteAllText("c:\Users\Niyas\manbro\scripts\page_stream_decompressed.txt", $decomp)
Write-Output "Successfully saved to page_stream_decompressed.txt!"
