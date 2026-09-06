# Agricultura Urbana-Saúde

## Estrutura

- `hortas_dash.py`: backend Flask e APIs.
- `templates/`: páginas HTML com Jinja.
- `static/css/`: CSS geral e CSS específico de cada página.
- `static/js/`: JavaScript geral e scripts específicos.
- `static/data/`: dados GeoJSON.
- `static/img/`: imagens utilizadas pelo projeto.
- `.vscode/`: configuração para abrir e executar diretamente no VS Code.

## Executar no VS Code

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python hortas_dash.py
```

Abra no navegador:

`http://127.0.0.1:5000`
