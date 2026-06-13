from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'bahanbaku', views.BahanBakuViewSet)
router.register(r'transaksi', views.TransaksiPenjualanViewSet)
router.register(r'menu', views.MenuViewSet)
router.register(r'resep', views.ResepViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('predict/', views.perform_ai_prediction, name='ai_prediction'),
    path('login/', views.custom_login, name='custom_login'),
    path('dashboard-summary/', views.get_dashboard_summary, name='dashboard_summary'),
    path('menu-analytics/', views.get_menu_analytics, name='menu_analytics'),
    path('report-data/', views.get_report_data, name='report_data'),
    path('recommendations/', views.get_recommendations, name='recommendations'),
]
