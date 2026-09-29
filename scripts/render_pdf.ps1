Add-Type -AssemblyName System.Runtime.WindowsRuntime
Add-Type -AssemblyName System.Drawing

[Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null

$asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.ContainsGenericParameters
} | Select-Object -First 1

function Await($asyncOp, $type) {
    $targetMethod = $asTaskGeneric.MakeGenericMethod($type)
    $task = $targetMethod.Invoke($null, @($asyncOp))
    $task.Wait()
    return $task.Result
}

function AwaitAction($asyncAction) {
    $taskMethod = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and -not $_.ContainsGenericParameters
    } | Select-Object -First 1
    $task = $taskMethod.Invoke($null, @($asyncAction))
    $task.Wait()
}

$pdfPath = "C:\Users\Niyas\.gemini\antigravity-ide\brain\b2c19bc8-c56b-4d7d-aa21-118d31f7fde2\.user_uploaded\media_1789988515958.pdf"
$fileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($pdfPath)
$file = Await $fileOp ([Windows.Storage.StorageFile])

$docOp = [Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)
$doc = Await $docOp ([Windows.Data.Pdf.PdfDocument])

Write-Output "Pages: $($doc.PageCount)"
$page = $doc.GetPage(0)
Write-Output "Page 0 Size: $($page.Size.Width) x $($page.Size.Height)"

$outPath = "c:\Users\Niyas\manbro\scripts\rendered_pdf_page.png"
$outFileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync((New-Item -ItemType File -Path $outPath -Force).FullName)
$outFile = Await $outFileOp ([Windows.Storage.StorageFile])
$streamOp = $outFile.OpenAsync([Windows.Storage.FileAccessMode]::ReadWrite)
$stream = Await $streamOp ([Windows.Storage.Streams.IRandomAccessStream])

$renderOp = $page.RenderToStreamAsync($stream)
AwaitAction $renderOp

$stream.FlushAsync().GetResults() | Out-Null
$stream.Dispose()

Write-Output "Rendered PDF to $outPath successfully!"
