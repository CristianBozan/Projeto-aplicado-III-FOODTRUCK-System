@echo off
REM Script para renderizar arquivos PlantUML (Windows)
REM Requer plantuml.jar no mesmo diretório ou caminho absoluto para o jar.

set PLANTUML_JAR=plantuml.jar
if not exist %PLANTUML_JAR% (
  echo plantuml.jar nao encontrado no diretório atual.
  echo Baixe de https://plantuml.com/ e coloque ao lado deste script, ou instale CLI plantuml.
  exit /b 1
)

cd docs\diagrams
java -jar ..\..\%PLANTUML_JAR% -tpng *.puml
if %ERRORLEVEL% neq 0 (
  echo Erro ao renderizar diagrams.
  exit /b %ERRORLEVEL%
)

echo Diagrams renderizados em PNG em docs\diagrams
pause
