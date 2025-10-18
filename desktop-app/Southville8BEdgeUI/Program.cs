using System;
using System.Collections.Generic;
using System.Net.Http;
using Avalonia;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Southville8BEdgeUI.Services;

namespace Southville8BEdgeUI
{
    internal sealed class Program
    {
        // Initialization code. Don't use any Avalonia, third-party APIs or any
        // SynchronizationContext-reliant code before AppMain is called: things aren't initialized
        // yet and stuff might break.
        [STAThread]
        public static void Main(string[] args)
        {
            // Build configuration
            var configuration = new ConfigurationBuilder()
                .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            // Build host with dependency injection
            var host = Host.CreateDefaultBuilder(args)
                .ConfigureServices((context, services) =>
                {
                    // Configuration
                    services.AddSingleton<IConfiguration>(configuration);

                    // HTTP Client
                    services.AddSingleton<HttpClient>();

                    // Services
                    services.AddSingleton<ITokenStorageService, TokenStorageService>();
                    services.AddSingleton<IApiClient, ApiClient>();
                    services.AddSingleton<IAuthService, AuthService>();
                    services.AddSingleton<IRoleValidationService, RoleValidationService>();
                    services.AddSingleton<IToastService, ToastService>();
                    services.AddSingleton<IDialogService, DialogService>();
                })
                .Build();

            // Set up service locator for Avalonia
            ServiceLocator.Services = host.Services;

            BuildAvaloniaApp()
                .StartWithClassicDesktopLifetime(args);
        }

        // Avalonia configuration, don't remove; also used by visual designer.
        public static AppBuilder BuildAvaloniaApp()
            => AppBuilder.Configure<App>()
                .UsePlatformDetect()
                .LogToTrace();
    }

    // Simple service locator for Avalonia
    public static class ServiceLocator
    {
        public static IServiceProvider Services { get; set; } = null!;
    }
}
