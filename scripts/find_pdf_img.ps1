Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem -Path "C:\Users\Niyas\.gemini\antigravity-ide\brain" -Recurse -Include *.png,*.jpg

foreach ($f in $files) {
    try {
        $bmp = [System.Drawing.Bitmap]::FromFile($f.FullName)
        if ($bmp.Height -gt 1000) {
            Write-Output "Found: $($f.FullName) : $($bmp.Width) x $($bmp.Height)"
        }
        $bmp.Dispose()
    } catch {}
}
