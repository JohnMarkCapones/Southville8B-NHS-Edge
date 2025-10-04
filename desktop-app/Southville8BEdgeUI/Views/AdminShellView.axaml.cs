using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Notifications;
using Southville8BEdgeUI.Services;
using System;

namespace Southville8BEdgeUI.Views;

public partial class AdminShellView : UserControl
{
    private readonly IToastService _toastService = new ToastService();
    private readonly IDialogService _dialogService = new DialogService();

    public AdminShellView()
    {
        InitializeComponent();
    }

    protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnAttachedToVisualTree(e);

        var window = TopLevel.GetTopLevel(this) as Window;
        if (window is not null)
        {
            _toastService.Initialize(window);
        }
    }

    // Expose helpers so View-layer code can trigger notifications if needed
    public void ShowNotification(string title, string message, Avalonia.Controls.Notifications.NotificationType type = Avalonia.Controls.Notifications.NotificationType.Information, TimeSpan? expiration = null)
        => _toastService.Show(title, message, type, expiration);

    // Provide accessors for services (optional, e.g., for child views)
    public IToastService Toasts => _toastService;
    public IDialogService Dialogs => _dialogService;
}