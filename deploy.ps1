# Deploy mingming-kanban to VPS
param(
    [switch]$SkipPush,
    [switch]$SkipBuild
)
& "E:\shared\scripts\deploy-vps.ps1" `
    -VpsDir "/opt/mingming-kanban" `
    -Service "mingming-kanban" `
    -GitRemote "origin" `
    -Port 3019 `
    -SkipPush:$SkipPush `
    -SkipBuild:$SkipBuild
