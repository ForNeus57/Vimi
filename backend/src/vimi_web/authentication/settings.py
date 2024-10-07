import string

USERNAME_VALIDATORS = {
    'general': {
        'required': True,
        'min_length': 8,
        'max_length': 32,
    },
    'html': {
        'type': 'text',
    },
    'validators': [
        {
            'NAME': 'vimi_web.authentication.validators.UsernameUniquenessValidator',
        },
    ],
}

FIRST_NAME_VALIDATORS = {
    'general': {
        'required': True,
        'min_length': 2,
        'max_length': 32,
    },
    'html': {
        'type': 'text',
    },
    'validators': [
        {
            'NAME': 'vimi_web.authentication.validators.SymbolsPresentsValidator',
            'OPTIONS': {
                'symbols': {
                    'uppercase': frozenset(string.ascii_uppercase),
                    'lowercase': frozenset(string.ascii_lowercase),
                },
            },
        },
    ],
}

LAST_NAME_VALIDATORS = {
    'general': {
        'required': True,
        'min_length': 2,
        'max_length': 48,
    },
    'html': {
        'type': 'text',
    },
    'validators': [
        {
            'NAME': 'vimi_web.authentication.validators.SymbolsPresentsValidator',
            'OPTIONS': {
                'symbols': {
                    'uppercase': frozenset(string.ascii_uppercase),
                    'lowercase': frozenset(string.ascii_lowercase),
                },
            },
        },
    ],
}

EMAIL_VALIDATORS = {
    'general': {
        'required': True,
    },
    'html': {
        'type': 'email',
    },
    'validators': [
        {
            'NAME': 'vimi_web.authentication.validators.EmailUniquenessValidator',
        },
    ],
}

PASSWORD_VALIDATORS = {
    'general': {
        'required': True,
        'min_length': 8,
        'max_length': 32,
    },
    'specific': {
        'write_only': True,
    },
    'html': {
        'type': 'password',
    },
    'validators': [
        {
            'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
        },
        {
            'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
        },
        {
            'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
        },
        {
            'NAME': 'vimi_web.authentication.validators.SymbolsPresentsValidator',
        },
    ],
}