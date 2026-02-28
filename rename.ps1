$dir = 'C:\Users\abhishek\Desktop\Hackathoon\Hackathon-Manager-Web-App'
$files = Get-ChildItem -Path $dir -Recurse -Include '*.html','*.js','*.css'
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $content = $content -replace 'HackConnect 2026', 'HackSphere'
    $content = $content -replace 'HackConnect2026', 'HackSphere'
    $content = $content -replace 'HackConnect', 'HackSphere'
    $content = $content -replace 'hackconnect', 'hacksphere'
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
}
Write-Host "Done - replaced in $($files.Count) files"
