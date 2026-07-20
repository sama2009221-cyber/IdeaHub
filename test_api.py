import urllib.request, json

def req(url, data=None, token=None, content_type='application/json'):
    req = urllib.request.Request('http://localhost:8000/api' + url)
    if data:
        if isinstance(data, dict):
            req.data = json.dumps(data).encode('utf-8')
        else:
            req.data = data
        req.add_header('Content-Type', content_type)
    if token:
        req.add_header('Authorization', 'Bearer ' + token)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return {'error': e.code, 'body': e.read().decode('utf-8')}

reg = req('/auth/register/', {'username': 'testusr7', 'password': 'testpassword', 'email': 'test@test.com'})
print('Reg:', reg)

login = req('/auth/login/', {'username': 'testusr7', 'password': 'testpassword'})
print('Login:', login)

token = login.get('access')
if token:
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = (
        '--' + boundary + '\r\n'
        'Content-Disposition: form-data; name="title"\r\n\r\n'
        'Test Multipart\r\n'
        '--' + boundary + '\r\n'
        'Content-Disposition: form-data; name="description"\r\n\r\n'
        'test desc\r\n'
        '--' + boundary + '\r\n'
        'Content-Disposition: form-data; name="status"\r\n\r\n'
        'submitted\r\n'
        '--' + boundary + '--\r\n'
    ).encode('utf-8')
    res2 = req('/ideas/', body, token, 'multipart/form-data; boundary=' + boundary)
    print('Submit Idea:', res2)
