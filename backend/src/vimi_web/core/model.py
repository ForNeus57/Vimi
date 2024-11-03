from django.db.models.base import ModelBase
from django.apps import apps

class ModelMetaClass(ModelBase):
    def __new__(cls, name, bases, attrs):
        new_class = super().__new__(cls, name, bases, attrs)
        app = apps.get_app_config('vimi_web.api')

        new_class.Meta.db_table = f"{app.name.split('.')[-1]}_"
        new_class.Meta.verbose_name_plural = "News"
        return new_class
