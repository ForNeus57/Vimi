from django.apps import AppConfig
# from django.db import connection
# from django.db.models.signals import pre_migrate


class ApiConfig(AppConfig):
    name = 'vimi_web.api'
    verbose_name = 'API'

    # def ready(self) -> None:
    #     pre_migrate.connect(self.create_default_models, sender=self)

    # def create_default_models(self, *args, **kwargs) -> None:
    #     print('Creating default models')
    #
    #     composite_type_sql: str = """CREATE TYPE model_layer AS (name varchar(64), dimensions integer[3]);"""
    #     cursor = connection.cursor()
    #     cursor.execute(composite_type_sql)
    #
    #     print('Created model_layer composite type')
