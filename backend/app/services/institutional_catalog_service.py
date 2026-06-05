from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.academic import Campus, Faculty


class InstitutionalCatalogService:
    def __init__(self, db: Session):
        self.db = db

    def list_faculties(self):
        return self.db.query(Faculty).order_by(Faculty.name).all()

    def get_faculty(self, item_id: int):
        return self._require(Faculty, item_id, "Facultad")

    def create_faculty(self, payload):
        return self._create(Faculty, payload)

    def update_faculty(self, item_id: int, payload):
        return self._update(self.get_faculty(item_id), payload)

    def delete_faculty(self, item_id: int):
        self._delete(self.get_faculty(item_id))
        return {"message": "Facultad eliminada correctamente"}

    def list_campuses(self):
        return self.db.query(Campus).order_by(Campus.name).all()

    def get_campus(self, item_id: int):
        return self._require(Campus, item_id, "Sede")

    def create_campus(self, payload):
        return self._create(Campus, payload)

    def update_campus(self, item_id: int, payload):
        return self._update(self.get_campus(item_id), payload)

    def delete_campus(self, item_id: int):
        self._delete(self.get_campus(item_id))
        return {"message": "Sede eliminada correctamente"}

    def _require(self, model, item_id: int, label: str):
        item = self.db.query(model).filter(model.id == item_id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{label} no encontrada")
        return item

    def _create(self, model, payload):
        item = model(**payload.model_dump())
        self.db.add(item)
        self._commit(item)
        return item

    def _update(self, item, payload):
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(item, field, value)
        self._commit(item)
        return item

    def _delete(self, item):
        self.db.delete(item)
        self._commit()

    def _commit(self, item=None):
        try:
            self.db.commit()
            if item is not None:
                self.db.refresh(item)
        except IntegrityError as error:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre o codigo ya esta registrado, o el registro tiene relaciones activas",
            ) from error
