# deploy.ps1 - Deploy mingming-kanban to VPS
# Usage: .\deploy.ps1 [-SkipPush] [-SkipBuild]
& E:\shared\scripts\deploy-vps.ps1 `
    -VpsDir "/opt/mingming-kanban" `
    -Service "mingming-kanban" `
    -GitRemote "github-mingming:markkennethbadilla/mingming-kanban.git" `
    -Port 3019 `
    @args
