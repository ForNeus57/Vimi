"""All views for Django API Application"""

from functools import reduce

from django.core.files.base import ContentFile
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.renderers import JSONRenderer
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from vimi_web.api.models import Architecture, ColorMap, NetworkInput, Texture, Interference, \
    Layer, Activation
from vimi_web.api.renderers import TextureFileRenderer
from vimi_web.api.serializers import (
    ArchitectureAllSerializer,
    NetworkInputCreateSerializer,
    NetworkInputProcessSerializer,
    ColorMapAllSerializer,
    ColorMapProcessSerializer,
    ColorMapNormalizationAllSerializer, TextureSerializer, NetworkInputTransformationAllSerializer,
    ColorMapIndicatorSerializer, ArchitectureProcessedAllSerializer, LayersByProcessedArchitectureSerializer,
    LayerSerializer, ActivationByLayerSerializer, ActivationSerializer, ActivationCompareSerializer,
)


class ArchitectureAllView(APIView):
    """Returns all supported Neural-Network Architectures with layers"""

    permission_classes = (AllowAny,)
    queryset = Architecture.objects.all()
    serializer_class = ArchitectureAllSerializer

    @method_decorator(cache_page(60 * 60 * 24))
    def get(self, request: Request) -> Response:
        serializer = self.serializer_class(self.queryset.all(), many=True)

        return Response(serializer.data, status=200)


class ArchitectureProcessedAllView(APIView):
    permission_classes = (AllowAny,)
    queryset = Architecture.objects.filter(id__in=Interference.objects.values('architecture_id')).distinct().order_by('id')
    serializer_class = ArchitectureProcessedAllSerializer

    def get(self, request: Request) -> Response:
        serializer = self.serializer_class(self.queryset.all(), many=True)

        return Response(serializer.data, status=200)


class LayersByProcessedArchitectureView(APIView):
    permission_classes = (AllowAny,)
    queryset = Layer.objects.all()
    serializer_class = LayersByProcessedArchitectureSerializer

    def get(self, request: Request,) -> Response:
        architecture_serializer = self.serializer_class(data=request.query_params)

        if architecture_serializer.is_valid():
            architecture = architecture_serializer.validated_data['processed_architecture']
            queryset = self.queryset.filter(activations__inference__architecture=architecture).distinct('layer_number').order_by('layer_number')
            layer_serializer = LayerSerializer(queryset, many=True)

            return Response(layer_serializer.data, status=200)

        return Response(architecture_serializer.errors, status=400)


class NetworkInputView(APIView):
    permission_classes = (AllowAny,)
    queryset = NetworkInput.objects.all()
    parser_classes = (MultiPartParser, FormParser,)
    serializer_class = NetworkInputCreateSerializer

    def post(self, request: Request) -> Response:
        # TODO: change this so it uses ListSerializer and argument many=True and data=request.data
        serializer = self.serializer_class(data={'file': request.FILES['file']})

        if serializer.is_valid():
            instance: NetworkInput = serializer.save()

            return Response({'uuid': instance.uuid}, status=201)

        return Response(serializer.errors, status=400)


class NetworkInputTransformationAllView(APIView):
    """Return all supported Network Input Transformations"""
    permission_classes = (AllowAny,)
    serializer_class = NetworkInputTransformationAllSerializer

    @method_decorator(cache_page(60 * 60 * 24))
    def get(self, request: Request) -> Response:
        serializer = self.serializer_class(map(lambda x: {'id': x[0], 'name': x[1]}, NetworkInput.Transformation.choices),
                                           many=True)

        return Response(serializer.data, status=200)



class NetworkInputProcessView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = NetworkInputProcessSerializer

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            predictions, activations = serializer.save()

            return Response({
                    'predictions': map(lambda x: {'prediction_number': x.prediction_number, 'class_name': x.class_name, 'class_score': x.class_score},
                                       predictions),
                    'activations': map(lambda x: {'activation_uuid': x.uuid, 'layer_uuid': x.layer.uuid},
                                       activations),
                },
                status=201,
            )

        return Response(serializer.errors, status=400)


class ActivationView(APIView):
    permission_classes = (AllowAny,)
    queryset = Activation.objects.all()
    serializer_class = ActivationByLayerSerializer

    def get(self, request: Request) -> Response:
        layer_serializer = self.serializer_class(data=request.query_params)

        if layer_serializer.is_valid():
            layer = layer_serializer.validated_data['processed_layer']
            queryset = self.queryset.filter(layer=layer)
            # TODO: assert minimum filters!
            min_filters = queryset.first().to_numpy().shape[-1]
            activation_serializer = ActivationSerializer(queryset, many=True)

            return Response({'filter_number': min_filters, 'activations': activation_serializer.data}, status=200)

        return Response(layer_serializer.errors, status=400)


class ActivationCompareView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = ActivationCompareSerializer

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data, context={'request': request})

        if serializer.is_valid():
            instance = serializer.save()

            return Response(instance, status=200)

        return Response(serializer.errors, status=400)


class ColorMapAllView(APIView):
    """Returns all supported Color Maps"""
    permission_classes = (AllowAny,)
    queryset = ColorMap.objects.all()
    serializer_class = ColorMapAllSerializer

    @method_decorator(cache_page(60 * 60 * 24))
    def get(self, request: Request) -> Response:
        serializer = self.serializer_class(self.queryset.all(), context={'request': request}, many=True)

        return Response(serializer.data, status=200)


class ColorMapProcessView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = ColorMapProcessSerializer

    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            instance: Texture = serializer.save()

            return Response({'urls': instance.get_available_urls(request), 'shape': instance.shape}, status=201)

        return Response(serializer.errors, status=400)


class ColorMapNormalizationAllView(APIView):
    """Return all supported Color Map Normalization Types"""
    permission_classes = (AllowAny,)
    serializer_class = ColorMapNormalizationAllSerializer

    @method_decorator(cache_page(60 * 60 * 24))
    def get(self, request: Request) -> Response:
        serializer = self.serializer_class(map(lambda x: {'id': x[0], 'name': x[1]}, ColorMap.Normalization.choices),
                                           many=True)

        return Response(serializer.data, status=200)


class ColorMapIndicatorView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = ColorMapIndicatorSerializer
    # TODO: Write custom negotiation of the renderer
    renderer_classes = (TextureFileRenderer, JSONRenderer,)

    @method_decorator(cache_page(60 * 60 * 24))
    def get(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.query_params)

        if serializer.is_valid():
            instance: ContentFile = serializer.save()

            return Response(instance.read(),
                            status=200,
                            headers={'Content-Disposition': f'attachment; filename="{instance.name}"'},
                            content_type='image/png')

        return Response(serializer.errors, status=400)


class TextureView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = TextureSerializer
    # TODO: Write custom negotiation of the renderer
    renderer_classes = (TextureFileRenderer, JSONRenderer,)

    def get(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.query_params)

        if serializer.is_valid():
            instance: ContentFile = serializer.save()

            return Response(instance.read(),
                            status=200,
                            headers={'Content-Disposition': f'attachment; filename="{instance.name}"'},
                            content_type='image/png')

        return Response(serializer.errors, status=400)
