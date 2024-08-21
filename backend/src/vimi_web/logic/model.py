from django.db.models.base import ModelBase

from vimi_web.api.apps import ApiConfig

class ModelMetaClass(ModelBase):
    def __new__(cls, name, bases, attrs):
        new_class = super().__new__(cls, name, bases, attrs)

        # new_class._meta.db_table = f"{ApiConfig.name.split('.')[-1]}_"
        # new_class._meta.verbose_name_plural = "News"
        return new_class
