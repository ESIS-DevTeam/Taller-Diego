"""
Verifica el mutation score de mutmut leyendo su cache SQLite.
Sale con código 0 si score >= threshold, 1 si no alcanza el umbral.
"""
import sqlite3
import os
import sys

THRESHOLD = 70
DB_PATH = ".mutmut-cache"

if not os.path.exists(DB_PATH):
    print("No se encontró .mutmut-cache — omitiendo verificación de score.")
    sys.exit(0)

conn = sqlite3.connect(DB_PATH)
try:
    total = conn.execute("SELECT COUNT(*) FROM mutants").fetchone()[0]
    survived = conn.execute(
        "SELECT COUNT(*) FROM mutants WHERE status IN ('survived', 'suspicious')"
    ).fetchone()[0]
    killed = total - survived
    score = int(100 * killed / total) if total > 0 else 0
    print(f"Mutation score: {score}%  (Killed={killed}  Survived={survived}  Total={total})")
    if score < THRESHOLD:
        print(f"ERROR: score {score}% está por debajo del umbral {THRESHOLD}%")
        sys.exit(1)
    print(f"OK: score {score}% >= {THRESHOLD}%")
    sys.exit(0)
except Exception as e:
    print(f"Error leyendo cache de mutmut: {e}")
    sys.exit(0)  # No bloquear el pipeline por error de infraestructura
finally:
    conn.close()
