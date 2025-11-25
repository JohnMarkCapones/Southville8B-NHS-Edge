using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Notifications;
using Southville8BEdgeUI.Services;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

namespace Southville8BEdgeUI.Views;

public partial class AdminShellView : UserControl
{
    private readonly IToastService _toastService;
    private readonly IDialogService _dialogService;

    public AdminShellView()
    {
        InitializeComponent();
        
        // Only get services from DI container if not in design mode
        if (!Design.IsDesignMode)
        {
            // Get services from DI container
            _toastService = ServiceLocator.Services.GetRequiredService<IToastService>();
            _dialogService = ServiceLocator.Services.GetRequiredService<IDialogService>();
        }
        else
        {
            // Design mode: use null-safe stubs
            _toastService = new DesignTimeToastService();
            _dialogService = new DesignTimeDialogService();
        }
    }

    protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnAttachedToVisualTree(e);
        // ToastService is now initialized in MainWindow, no need to initialize here
    }

    // Expose helpers so View-layer code can trigger notifications if needed
    public void ShowNotification(string title, string message, Avalonia.Controls.Notifications.NotificationType type = Avalonia.Controls.Notifications.NotificationType.Information, TimeSpan? expiration = null)
        => _toastService.Show(title, message, type, expiration);

    // Provide accessors for services (optional, e.g., for child views)
    public IToastService Toasts => _toastService;
    public IDialogService Dialogs => _dialogService;
}

// Design-time service stubs for XAML designer
internal class DesignTimeToastService : IToastService
{
    public void Initialize(Window host) { }
    public void Show(string title, string message, NotificationType type = NotificationType.Information, TimeSpan? expiration = null) { }
    public void Success(string message, string? title = null, TimeSpan? expiration = null) { }
    public void Error(string message, string? title = null, TimeSpan? expiration = null) { }
    public void Warning(string message, string? title = null, TimeSpan? expiration = null) { }
    public void Info(string message, string? title = null, TimeSpan? expiration = null) { }
}

internal class DesignTimeDialogService : IDialogService
{
    public Task<bool> ConfirmDeleteAsync(string title, string message) => Task.FromResult(false);
    public Task ShowInfoAsync(string title, System.Collections.Generic.Dictionary<string, string> details) => Task.CompletedTask;
    public Task<bool> ShowConfirmAsync(string title, string message, string confirmText = "OK", string cancelText = "Cancel") => Task.FromResult(false);
    public Task<string?> ShowInputDialogAsync(string title, string message, string placeholder = "", string initialValue = "") => Task.FromResult<string?>(null);
    public Task<string?> ShowChoiceDialogAsync(string title, string message, string option1Text, string option2Text) => Task.FromResult<string?>(null);
}