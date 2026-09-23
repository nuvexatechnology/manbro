$txt = [System.IO.File]::ReadAllText("c:\Users\Niyas\manbro\scripts\x1_stream_decompressed.txt")
$lines = $txt -split "\r?\n"

$ctm = @(1,0,0,1,0,0)
$stack = New-Object System.Collections.ArrayList

$currentColor = ""

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i].Trim()
    
    if ($line -eq "q") {
        $stack.Add($ctm.Clone()) | Out-Null
    }
    elseif ($line -eq "Q") {
        if ($stack.Count -gt 0) {
            $ctm = $stack[$stack.Count - 1]
            $stack.RemoveAt($stack.Count - 1)
        }
    }
    elseif ($line -match '^([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)\s+cm$') {
        # Multiply matrix
        $m0 = [double]$Matches[1]; $m1 = [double]$Matches[2]
        $m2 = [double]$Matches[3]; $m3 = [double]$Matches[4]
        $m4 = [double]$Matches[5]; $m5 = [double]$Matches[6]
        
        $new4 = $ctm[0]*$m4 + $ctm[2]*$m5 + $ctm[4]
        $new5 = $ctm[1]*$m4 + $ctm[3]*$m5 + $ctm[5]
        $ctm[4] = $new4
        $ctm[5] = $new5
    }
    elseif ($line -match '^(\d+\.?\d*)\s+(\d+\.?\d*)\s+(\d+\.?\d*)\s+(scn|SCN)$') {
        $r = [int][Math]::Round([double]$Matches[1] * 255)
        $g = [int][Math]::Round([double]$Matches[2] * 255)
        $b = [int][Math]::Round([double]$Matches[3] * 255)
        $currentColor = "#{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
    }
    elseif ($line -match '(\bDo\b|\bf\*?\b|\bS\b|\bB\*?\b)') {
        # Drawing action!
        $op = $Matches[1]
        $x = $ctm[4]
        $y = $ctm[5]
        $topY = 2066 - $y
        if ($line -match '/(X\d+)\s+Do') {
            Write-Output ("IMAGE/XOBJECT {0} at x={1:F1}, topY={2:F1} (y={3:F1})" -f $Matches[1], $x, $topY, $y)
        } elseif ($currentColor -ne "" -and $currentColor -ne "#FFFFFF") {
            Write-Output ("COLOR {0} drawing {1} at x={2:F1}, topY={3:F1} (y={4:F1})" -f $currentColor, $op, $x, $topY, $y)
        }
    }
}
