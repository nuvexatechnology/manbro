Add-Type -AssemblyName System.Runtime.WindowsRuntime
Add-Type -AssemblyName System.Drawing

[Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null

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

$pdfPath = "c:\Users\Niyas\manbro\scripts\input.pdf"
$fileStream = [System.IO.File]::OpenRead($pdfPath)
$winrtStream = [System.IO.WindowsRuntimeStreamExtensions]::AsRandomAccessStream($fileStream)

$docOp = [Windows.Data.Pdf.PdfDocument]::LoadFromStreamAsync($winrtStream)
$doc = Await $docOp ([Windows.Data.Pdf.PdfDocument])

Write-Output "PDF Page Count: $($doc.PageCount)"
$page = $doc.GetPage(0)
Write-Output "Page 0 Size: $($page.Size.Width) x $($page.Size.Height)"

$outPath = "c:\Users\Niyas\manbro\scripts\page_rendered.png"
if (Test-Path $outPath) { Remove-Item $outPath -Force }
$outFileStream = [System.IO.File]::OpenWrite($outPath)
$outWinrtStream = [System.IO.WindowsRuntimeStreamExtensions]::AsRandomAccessStream($outFileStream)

$renderOptions = New-Object Windows.Data.Pdf.PdfPageRenderOptions
# Render at higher resolution or normal
$renderOp = $page.RenderToStreamAsync($outWinrtStream, $renderOptions)
AwaitAction $renderOp

$outWinrtStream.FlushAsync().GetResults() | Out-Null
$outWinrtStream.Dispose()
$outFileStream.Dispose()
$winrtStream.Dispose()
$fileStream.Dispose()

Write-Output "Rendered to $outPath successfully! Size: $((Get-Item $outPath).Length)"
