Add-Type -AssemblyName System.Drawing

$src = 'D:\React\sorona-tiles\sorona-tiles\src\assets\logo.png'
$dst = 'D:\React\sorona-tiles\sorona-tiles\src\assets\logo_cropped.png'

$img = [System.Drawing.Image]::FromFile($src)
Write-Host "Original size: $($img.Width) x $($img.Height)"

# Trim ~8% from each side to remove white padding
$cropX = [int]($img.Width * 0.06)
$cropY = [int]($img.Height * 0.08)
$cropW = [int]($img.Width - $cropX * 2)
$cropH = [int]($img.Height - $cropY * 1.5)

$cropped = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$destRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
$g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$cropped.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
$cropped.Dispose()

Write-Host "Saved cropped logo to: $dst"
Write-Host "Cropped size: $cropW x $cropH"
