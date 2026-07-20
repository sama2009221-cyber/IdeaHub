release: cd backend && python manage.py migrate --noinput
web: cd backend && gunicorn backend.wsgi --bind 0.0.0.0:$PORT
