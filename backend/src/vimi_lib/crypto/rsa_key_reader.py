from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey


def generate_rsa_private_key(bit_size: int = 8192) -> RSAPrivateKey:
    return rsa.generate_private_key(
        key_size=bit_size,
        public_exponent=65537,
        backend=default_backend()
    )

