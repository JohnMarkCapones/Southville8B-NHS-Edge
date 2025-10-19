using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Notifications;
using Southville8BEdgeUI.Services;
using System;
using Microsoft.Extensions.DependencyInjection;

namespace Southville8BEdgeUI.Views;

public partial class AdminShellView : UserControl
{
    private readonly IToastService _toastService;
    private readonly IDialogService _dialogService;

    public AdminShellView()
    {
        InitializeComponent();
        
        // Get services from DI container
        _toastService = ServiceLocator.Services.GetRequiredService<IToastService>();
        _dialogService = ServiceLocator.Services.GetRequiredService<IDialogService>();
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