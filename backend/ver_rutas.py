# D:\TALLER 2\optiacademic\backend\ver_rutas.py
import sys
import os
import requests
import json

print("="*60)
print("🔍 VERIFICANDO RUTAS DE LA API")
print("="*60)

try:
    # Intentar obtener OpenAPI
    response = requests.get('http://localhost:8000/openapi.json', timeout=5)
    
    if response.status_code == 200:
        data = response.json()
        paths = data.get('paths', {})
        
        print(f"\n✅ API respondiendo correctamente")
        print(f"📋 Total de rutas: {len(paths)}")
        
        print("\n📌 RUTAS DISPONIBLES:")
        print("-" * 50)
        for path in sorted(paths.keys()):
            methods = list(paths[path].keys())
            print(f"   {path} -> {methods}")
        
    else:
        print(f"❌ Error: {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("❌ ERROR: No se puede conectar al backend")
    print("   Asegúrate de que el backend está corriendo en http://localhost:8000")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "="*60)