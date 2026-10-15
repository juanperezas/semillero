#!/usr/bin/env python3
"""
Exporta los datos de matriculados en un formato compacto apto para filtrar
en el navegador (sin backend): cada columna categórica se codifica como
número + una tabla de equivalencias, para que el archivo pese poco.

Genera:
  data/categorias.json   -> listas de valores posibles por columna
  data/matriculados.csv  -> una fila por estudiante, solo con códigos (números)
  data/resumen.json      -> totales generales para la vista sin filtros

Uso:
    python exportar_dashboard.py Matriculados_20260731_jp_limpio.xlsx
"""
import sys
import json
import pandas as pd

ENTRADA = sys.argv[1] if len(sys.argv) > 1 else "Matriculados_20260731_jp_limpio.xlsx"

# Columnas que se podrán usar como filtro / dimensión en el dashboard
COLUMNAS_FILTRO = [
    "Sexo", "Sede", "Facultad", "Area Conocimiento", "Nombre Programa",
    "Modalidad", "Tipo Programa", "Tipo Inscripcion", "Id Estrato",
    "Ciudad Nacimiento", "Pais Nacimiento",
]


def main():
    df = pd.read_excel(ENTRADA, sheet_name="Data")
    df["Id Estrato"] = df["Id Estrato"].astype(str)

    categorias = {}
    codigos = pd.DataFrame(index=df.index)

    for col in COLUMNAS_FILTRO:
        cat = df[col].astype("category")
        categorias[col] = list(cat.cat.categories)
        codigos[col] = cat.cat.codes  # -1 si es nulo (no debería haber)

    # CSV compacto: solo números separados por coma, con encabezado
    codigos.to_csv("../data/matriculados.csv", index=False)

    with open("../data/categorias.json", "w", encoding="utf-8") as f:
        json.dump(categorias, f, ensure_ascii=False)

    resumen = {
        "total_matriculados": int(len(df)),
        "anio": int(df["Ano"].iloc[0]),
        "columnas_filtro": COLUMNAS_FILTRO,
    }
    with open("../data/resumen.json", "w", encoding="utf-8") as f:
        json.dump(resumen, f, ensure_ascii=False, indent=2)

    print(f"Filas exportadas: {len(df):,}")
    for col in COLUMNAS_FILTRO:
        print(f"  {col}: {len(categorias[col])} valores distintos")


if __name__ == "__main__":
    main()
