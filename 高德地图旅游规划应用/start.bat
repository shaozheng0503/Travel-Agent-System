@echo off
chcp 65001 >nul
echo 启动智能旅游规划助手...
echo.
echo 正在启动本地服务器...
echo 请稍等...
echo.

REM 检查是否安装了Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo 使用Python启动服务器...
    python -m http.server 8000
) else (
    REM 检查是否安装了Node.js
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo 使用Node.js启动服务器...
        npx http-server -p 8000 -o
    ) else (
        echo 错误：未找到Python或Node.js
        echo 请安装Python或Node.js后重试
        echo.
        echo 或者直接在浏览器中打开 index.html 文件
        pause
        exit /b 1
    )
)

echo.
echo 服务器已启动！
echo 请在浏览器中访问：http://localhost:8000
echo.
echo 按任意键退出...
pause >nul 