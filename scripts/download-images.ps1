# Downloads stock images from Pexels CDN. Subjects documented in public/images/CREDITS.md
$ua = @{ "User-Agent" = "Mozilla/5.0" }
$root = Join-Path $PSScriptRoot "..\public\images" | Resolve-Path
function Pex([int]$id, [int]$w) {
  "https://images.pexels.com/photos/$id/pexels-photo-$id.jpeg?auto=compress&cs=tinysrgb&w=$w"
}
@("hero", "categories", "products", "banners", "shop") | ForEach-Object {
  New-Item -ItemType Directory -Force -Path (Join-Path $root $_) | Out-Null
}
$map = @(
  @("hero\hero-painting.jpg", (Pex 1669754 1600)),
  @("categories\paints.jpg", (Pex 6764240 800)),
  @("categories\plywood.jpg", (Pex 12278576 800)),
  @("categories\hardware.jpg", (Pex 7019603 800)),
  @("categories\plumbing.jpg", (Pex 4017967 800)),
  @("categories\electrical.jpg", (Pex 14129562 800)),
  @("categories\tools.jpg", (Pex 30413428 800)),
  @("categories\adhesives.jpg", (Pex 7508801 800)),
  @("banners\interior-living.jpg", (Pex 1571460 900)),
  @("banners\exterior-house.jpg", (Pex 106399 900)),
  @("shop\storefront.jpg", (Pex 24862481 1200)),
  @("shop\interior.jpg", (Pex 6764240 900)),
  @("shop\counter.jpg", (Pex 7019603 900)),
  @("products\paint-interior-premium.jpg", (Pex 6920160 800)),
  @("products\paint-interior-economy.jpg", (Pex 6764240 800)),
  @("products\paint-exterior-premium.jpg", (Pex 106399 800)),
  @("products\paint-exterior-value.jpg", (Pex 1669754 800)),
  @("products\paint-berger-interior.jpg", (Pex 6920160 800)),
  @("products\paint-nerolac-interior.jpg", (Pex 6920160 800)),
  @("products\paint-dulux-interior.jpg", (Pex 6920160 800)),
  @("products\marine-plywood.jpg", (Pex 12278576 800)),
  @("products\commercial-plywood.jpg", (Pex 271743 800)),
  @("products\block-board.jpg", (Pex 12278569 800)),
  @("products\mdf-board.jpg", (Pex 12278569 800)),
  @("products\laminate-wood.jpg", (Pex 271743 800)),
  @("products\door-lock.jpg", (Pex 7641991 800)),
  @("products\padlock.jpg", (Pex 4170142 800)),
  @("products\hinges-handles.jpg", (Pex 6480707 800)),
  @("products\hettich-handle.jpg", (Pex 6480707 800)),
  @("products\power-drill.jpg", (Pex 30413428 800)),
  @("products\paint-tools.jpg", (Pex 6764240 800)),
  @("products\plumbing-pipes.jpg", (Pex 4017967 800)),
  @("products\pvc-pipe-finolex.jpg", (Pex 4017967 800)),
  @("products\wood-adhesive.jpg", (Pex 7508801 800)),
  @("products\interior-room.jpg", (Pex 1571460 800)),
  @("products\exterior-house.jpg", (Pex 106399 800)),
  @("products\enamel-metal.jpg", (Pex 6068821 800)),
  @("products\primer-wall.jpg", (Pex 6764240 800)),
  @("products\putty-smooth-wall.jpg", (Pex 1669754 800)),
  @("products\waterproofing-roof.jpg", (Pex 106399 800)),
  @("products\electrical-switch.jpg", (Pex 14129562 800))
)
foreach ($row in $map) {
  $f = Join-Path $root $row[0]
  $u = $row[1]
  Invoke-WebRequest -Uri $u -OutFile $f -UseBasicParsing -Headers $ua -TimeoutSec 120
  $sz = (Get-Item $f).Length
  if ($sz -lt 5000) { throw "Download too small: $f ($sz bytes)" }
  Write-Host "OK $($row[0]) $sz"
}
