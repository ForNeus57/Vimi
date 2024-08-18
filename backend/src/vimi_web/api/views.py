from django.http import JsonResponse

# Create your views here.

def frontend_config(request) -> JsonResponse:
    return JsonResponse({'extension': ['jpg', 'jpeg', 'png', 'gif']}, safe=False)
    # return JsonResponse({'extension': list(app.config['ALLOWED_EXTENSIONS'])}, safe=False)
