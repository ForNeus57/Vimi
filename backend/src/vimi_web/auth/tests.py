from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.test import TestCase

class AuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpassword123')
        self.token = RefreshToken.for_user(self.user)

    def test_obtain_token(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {'username': 'testuser', 'password': 'testpassword123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)
        self.assertTrue('refresh' in response.data)

    def test_refresh_token(self):
        url = reverse('token_refresh')
        response = self.client.post(url, {'refresh': str(self.token)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)

    def test_verify_token(self):
        url = reverse('token_verify')
        response = self.client.post(url, {'token': str(self.token.access_token)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_blacklist_token(self):
        url = reverse('token_blacklist')
        response = self.client.post(url, {'refresh': str(self.token)}, format='json')
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
