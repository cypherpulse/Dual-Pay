@SETLOCAL
@IF NOT DEFINED NODE_PATH (
  @SET "NODE_PATH=G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\eslint@9.39.2_jiti@1.21.7\node_modules\eslint\bin\node_modules;G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\eslint@9.39.2_jiti@1.21.7\node_modules\eslint\node_modules;G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\eslint@9.39.2_jiti@1.21.7\node_modules;G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\node_modules"
) ELSE (
  @SET "NODE_PATH=G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\eslint@9.39.2_jiti@1.21.7\node_modules\eslint\bin\node_modules;G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\eslint@9.39.2_jiti@1.21.7\node_modules\eslint\node_modules;G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\eslint@9.39.2_jiti@1.21.7\node_modules;G:\2025\Learning\Blockchain\Stacks\Counter\DualPay\node_modules\.pnpm\node_modules;%NODE_PATH%"
)
@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\eslint\bin\eslint.js" %*
) ELSE (
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\..\eslint\bin\eslint.js" %*
)
