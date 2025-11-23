Arquivos PlantUML para os diagramas de arquitetura do projeto.

Arquivos gerados:
- sequence_create_pedido.puml
- sequence_backup.puml
- activity_restore.puml
- class_model.puml
- components.puml
- deployment.puml

Como renderizar (opções):

1) Usando PlantUML (jar)
- Baixe PlantUML: https://plantuml.com/ (arquivo plantuml.jar)
- Gere PNG de um arquivo:
  java -jar plantuml.jar sequence_create_pedido.puml
- Gere PDF com múltiplos arquivos (concatene ou crie um .puml que inclua outros):
  java -jar plantuml.jar -tpdf *.puml

2) Usando a CLI `plantuml` (se instalada no sistema)
  plantuml sequence_create_pedido.puml

3) Usando VSCode
- Abra o arquivo `.puml` e use extensão PlantUML para visualizar e exportar.

Observação: os arquivos .puml já refletem o comportamento do código (createBackup serializa instâncias para objetos plain; restore atualiza estoque e grava `estoque_logs`).
