@SETLOCAL
@IF NOT DEFINED NODE_PATH (
  @SET "NODE_PATH=G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\typescript@5.9.3\node_modules\typescript\bin\node_modules;G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\typescript@5.9.3\node_modules\typescript\node_modules;G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\typescript@5.9.3\node_modules;G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\node_modules"
) ELSE (
  @SET "NODE_PATH=G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\typescript@5.9.3\node_modules\typescript\bin\node_modules;G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\typescript@5.9.3\node_modules\typescript\node_modules;G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\typescript@5.9.3\node_modules;G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\node_modules;%NODE_PATH%"
)
@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\typescript\bin\tsserver" %*
) ELSE (
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\..\typescript\bin\tsserver" %*
)
