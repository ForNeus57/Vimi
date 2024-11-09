from rest_framework.renderers import BaseRenderer

class TextureFileRenderer(BaseRenderer):
    media_type = 'image/png'
    format = None
    charset = None
    render_style = 'binary'

    def render(self, data, media_type=None, renderer_context=None):
        return data