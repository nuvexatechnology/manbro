$lines = Get-Content 'C:\Users\Niyas\.gemini\antigravity-ide\brain\6f4b4922-ffb7-4d44-aa9c-611a632fee06\.system_generated\logs\transcript.jsonl'
$found = $false
foreach ($line in $lines) {
    if ($line -match 'blend the background') {
        $found = $true
    }
    if ($found -and $line -match 'replace_file_content|write_to_file') {
        Write-Output $line
        break
    }
}
