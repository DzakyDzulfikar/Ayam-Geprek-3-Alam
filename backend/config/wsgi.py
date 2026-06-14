"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os
import subprocess
import django

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()

# --- AUTOMATIC DEPLOYMENT & SEEDING TRIGGER FOR PYTHONANYWHERE ---
# This runs automatically when the web application reloads, bypassing console limits.
try:
    project_dir = '/home/ayamgeprek3alam/Ayam-Geprek-3-Alam'
    if os.path.exists(project_dir):
        # 1. Run git pull to pull the latest updates from GitHub
        result_pull = subprocess.run(
            ["git", "-c", "http.sslVerify=false", "pull"],
            cwd=project_dir,
            capture_output=True,
            text=True
        )
        # Write pull logs
        with open(os.path.join(project_dir, 'git_pull_trigger.log'), 'w') as f:
            f.write(f"STDOUT:\n{result_pull.stdout}\nSTDERR:\n{result_pull.stderr}")
            
        # 2. Run Django seed_data to reset and seed the database
        from django.core.management import call_command
        call_command('seed_data')
        
        # Write seed logs
        with open(os.path.join(project_dir, 'seed_data_trigger.log'), 'w') as f:
            f.write(f"Successfully seeded database on reload at {django.utils.timezone.now()}")
except Exception as e:
    project_dir = '/home/ayamgeprek3alam/Ayam-Geprek-3-Alam'
    if os.path.exists(project_dir):
        with open(os.path.join(project_dir, 'wsgi_trigger_error.log'), 'w') as f:
            f.write(f"Error occurred during automatic trigger: {str(e)}")

