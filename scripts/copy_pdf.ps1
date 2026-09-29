$pdfPath = "C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1789988515958.pdf"
$destPath = "c:\Users\Niyas\manbro\scripts\input.pdf"
Copy-Item -Path $pdfPath -Destination $destPath -Force
Write-Output "Copied PDF, Size: $((Get-Item $destPath).Length)"
