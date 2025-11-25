using Avalonia.Controls;
using Southville8BEdgeUI.Services;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace Southville8BEdgeUI.Views
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        protected override void OnOpened(EventArgs e)
        {
            base.OnOpened(e);
            
            // Initialize ToastService AFTER window is fully opened
            System.Diagnostics.Debug.WriteLine("=== MAIN WINDOW OPENED ===");
            var toastService = ServiceLocator.Services.GetRequiredService<IToastService>();
            toastService.Initialize(this);
            System.Diagnostics.Debug.WriteLine("=== TOAST SERVICE INITIALIZED FROM MAIN WINDOW ===");
        }
    }
}