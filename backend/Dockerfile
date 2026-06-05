FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY alembic.ini .
COPY alembic ./alembic
COPY app ./app
COPY public ./public
COPY seed_realistic_demo.py .
COPY seed_uc_ingenieria_sistemas_curriculum.py .
COPY seed_uc_isi_offerings_2026.py .
COPY seed_uc_isi_offerings_ready_demo.py .
COPY seed_uc_isi_student_enrollments_2026.py .
COPY seed_teacher_portal_demo.py .
COPY seed_huancayo_institutional_base.py .
COPY seed_huancayo_students_history_demo.py .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
