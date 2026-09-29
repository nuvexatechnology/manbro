$bytes = [System.IO.File]::ReadAllBytes("c:\Users\Niyas\manbro\scripts\input.pdf")
$txt = [System.Text.Encoding]::ASCII.GetString($bytes)

foreach ($id in @(404, 405, 406, 407, 408, 410, 412, 414, 416)) {
    $idx = $txt.IndexOf("$id 0 obj")
    if ($idx -ge 0) {
        $sub = $txt.Substring($idx, [Math]::Min(300, $txt.Length - $idx))
        $dict = ($sub -split "stream")[0]
        Write-Output "--- $id 0 obj ---"
        Write-Output $dict.Trim()
    }
}
