using System;
using System.Collections.Generic;
using System.Linq;
using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Data.Core.Plugins;
using Avalonia.Markup.Xaml;
using Microsoft.Extensions.DependencyInjection;
using Southville8BEdgeUI.ViewModels;
using Southville8BEdgeUI.Views;

namespace Southville8BEdgeUI
{
    public partial class App : Application
    {
        public override void Initialize()
        {
            AvaloniaXamlLoader.Load(this);
        }

        public override void OnFrameworkInitializationCompleted()
        {
            if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
            {
                // Avoid duplicate validations from both Avalonia and the CommunityToolkit. 
                // More info: https://docs.avaloniaui.net/docs/guides/development-guides/data-validation#manage-validationplugins
                DisableAvaloniaDataAnnotationValidation();
                
                // Get services from DI container
                var authService = ServiceLocator.Services.GetRequiredService<Services.IAuthService>();
                var toastService = ServiceLocator.Services.GetRequiredService<Services.IToastService>();
                var roleValidationService = ServiceLocator.Services.GetRequiredService<Services.IRoleValidationService>();
                var dialogService = ServiceLocator.Services.GetRequiredService<Services.IDialogService>();
                
                desktop.MainWindow = new MainWindow
                {
                    DataContext = new MainWindowViewModel(authService, toastService, roleValidationService, dialogService),
                };
            }

            base.OnFrameworkInitializationCompleted();
        }

        private void DisableAvaloniaDataAnnotationValidation()
        {
            // Get an array of plugins to remove
            var dataValidationPluginsToRemove =
                BindingPlugins.DataValidators.OfType<DataAnnotationsValidationPlugin>().ToArray();

            // remove each entry found
            foreach (var plugin in dataValidationPluginsToRemove)
            {
                BindingPlugins.DataValidators.Remove(plugin);
            }
        }
    }
}