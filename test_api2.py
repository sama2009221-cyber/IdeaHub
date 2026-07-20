import urllib.request
import json
data = json.dumps({'username': 'salma', 'password': 'password123', 'email': 'smo132@gmail.com', 'company_name': 'mobica', 'role': 'owner'}).encode('utf-8')
req = urllib.request.Request('http://localhost:8000/api/auth/register/', data=data, headers={'Content-Type': 'application/json'})
try:
    urllib.request.urlopen(req)
    print('OK')
except urllib.error.HTTPError as e:
    print(e.read().decode())
