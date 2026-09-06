from flask import Flask, jsonify, render_template
import json
import os
from pathlib import Path

import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / 'static'
DATA_DIR = STATIC_DIR / 'data'
DATA_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'horta-flask-secret-key')


def carregar_dados():
    """Retorna os dados atualmente usados pela aplicação."""
    dados = [
        {'centro_saude': 'CS Rio Vermelho', 'regiao': 'Norte', 'horta_ativa': True, 'lat': -27.4835, 'lon': -48.4265, 'responsavel': 'Jardim Saúde Ativa', 'plantas_medicinais': 'Erva baleeira, Espinheira santa, Boldo, Hortelã', 'dia_grupo_horta': 'Quarta-feira 14h', 'mutirao': '15/07/2026', 'data_atualizacao': '2026-06-15'},
        {'centro_saude': 'CS Barra da Lagoa', 'regiao': 'Norte', 'horta_ativa': True, 'lat': -27.4532, 'lon': -48.4781, 'responsavel': 'Maria Silva', 'plantas_medicinais': 'Hortelã, Boldo, Melissa, Alecrim', 'dia_grupo_horta': 'Terça-feira 09h', 'mutirao': 'Não', 'data_atualizacao': '2026-06-10'},
        {'centro_saude': 'CS Campeche', 'regiao': 'Sul', 'horta_ativa': True, 'lat': -27.6823, 'lon': -48.4821, 'responsavel': 'Carlos Alberto', 'plantas_medicinais': 'Erva baleeira, Manjericão, Alfavaca', 'dia_grupo_horta': 'Sexta-feira 16h', 'mutirao': '20/07/2026', 'data_atualizacao': '2026-06-12'},
        {'centro_saude': 'CS Trindade', 'regiao': 'Centro', 'horta_ativa': False, 'lat': -27.5823, 'lon': -48.5221, 'responsavel': 'Fernanda Lima', 'plantas_medicinais': 'Guaco, Boldo, Alfavaca', 'dia_grupo_horta': '', 'mutirao': '', 'data_atualizacao': '2026-06-01'},
    ]
    return pd.DataFrame(dados)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/mapa')
def mapa():
    return render_template('mapa.html')


@app.route('/hortas')
def hortas():
    return render_template('hortas.html', hortas=carregar_dados().to_dict('records'))


@app.route('/api/hortas')
def api_hortas():
    df = carregar_dados()

    features = []
    for _, row in df.iterrows():
        features.append({
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [float(row['lon']), float(row['lat'])]},
            'properties': {
                'nome': row['centro_saude'],
                'regiao': row['regiao'],
                'ativa': bool(row['horta_ativa']),
                'responsavel': row['responsavel'],
                'plantas_medicinais': row['plantas_medicinais'],
                'dia_grupo_horta': row['dia_grupo_horta'],
                'mutirao': row['mutirao'],
                'data_atualizacao': row['data_atualizacao'],
            },
        })

    geojson = {'type': 'FeatureCollection', 'features': features}
    arquivo_geojson = DATA_DIR / 'hortas.geojson'
    with arquivo_geojson.open('w', encoding='utf-8') as arquivo:
        json.dump(geojson, arquivo, ensure_ascii=False, indent=2)

    return jsonify(geojson)


@app.route('/api/resumo')
def api_resumo():
    df = carregar_dados()
    return jsonify({
        'total_hortas': len(df),
        'hortas_ativas': int(df['horta_ativa'].sum()),
        'regioes': df['regiao'].unique().tolist(),
        'total_responsaveis': int(df['responsavel'].nunique()),
        'total_plantas': int(df['plantas_medicinais'].str.split(',').explode().str.strip().nunique()),
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
