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
        # 1. Force update the files from GitHub (fetch + hard reset to main)
        subprocess.run(
            ["git", "-c", "http.sslVerify=false", "fetch", "--all"],
            cwd=project_dir,
            capture_output=True
        )
        result_pull = subprocess.run(
            ["git", "-c", "http.sslVerify=false", "reset", "--hard", "origin/main"],
            cwd=project_dir,
            capture_output=True,
            text=True
        )
        # Write pull logs
        with open(os.path.join(project_dir, 'git_pull_trigger.log'), 'w') as f:
            f.write(f"STDOUT:\n{result_pull.stdout}\nSTDERR:\n{result_pull.stderr}")
            
        # 2. Run Django seed_data only ONCE (using a lock file) to preserve custom edits
        lock_file = os.path.join(project_dir, 'seeding_done.lock')
        if not os.path.exists(lock_file):
            from django.core.management import call_command
            call_command('seed_data')
            with open(lock_file, 'w') as f:
                f.write(f"Successfully seeded database on reload at {django.utils.timezone.now()}")
        else:
            with open(os.path.join(project_dir, 'seed_data_trigger.log'), 'w') as f:
                f.write(f"Skipped seeding because lock file exists (edits preserved) at {django.utils.timezone.now()}")
except Exception as e:
    project_dir = '/home/ayamgeprek3alam/Ayam-Geprek-3-Alam'
    if os.path.exists(project_dir):
        with open(os.path.join(project_dir, 'wsgi_trigger_error.log'), 'w') as f:
            f.write(f"Error occurred during automatic trigger: {str(e)}")

