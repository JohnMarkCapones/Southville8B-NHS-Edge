using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Media;
using Southville8BEdgeUI.Utils;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Southville8BEdgeUI.Services;

public sealed class DialogService : IDialogService
{
    public Task<bool> ConfirmDeleteAsync(string title, string message)
    {
        var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        var dlg = new Window
        {
            CanResize = false,
            SystemDecorations = SystemDecorations.BorderOnly,
            SizeToContent = SizeToContent.WidthAndHeight,
            MinWidth = 360,
            MaxWidth = 560
        };

        // Use main window (if available) for theme resource resolution; fallback to dialog itself
        var owner = (Application.Current?.ApplicationLifetime as IClassicDesktopStyleApplicationLifetime)?.MainWindow;
        var themeScope = owner as StyledElement ?? (StyledElement)dlg;

        // Correct resource keys mapping to existing theme brushes
        var surfaceBrush = ThemeHelpers.GetBrush(themeScope, "CardBackgroundBrush", "#FFFFFF");
        var borderBrush = ThemeHelpers.GetBrush(themeScope, "BorderBrush", "#E5E7EB");
        var textPrimary = ThemeHelpers.GetBrush(themeScope, "TextPrimaryBrush", "#111827");
        var textSecondary = ThemeHelpers.GetBrush(themeScope, "TextSecondaryBrush", "#6B7280");
        var dangerBrush = ThemeHelpers.GetBrush(themeScope, "DangerBrush", "#EF4444");

        var confirmBtn = new Button
        {
            Content = "Delete",
            MinWidth = 92,
            Padding = new Thickness(12, 8),
            Background = dangerBrush,
            Foreground = Brushes.White,
            BorderThickness = new Thickness(0),
            CornerRadius = new CornerRadius(8),
            IsDefault = true,
            Margin = new Thickness(8, 0, 0, 0)
        };

        var cancelBtn = new Button
        {
            Content = "Cancel",
            MinWidth = 92,
            Padding = new Thickness(12, 8),
            Background = Brushes.Transparent,
            Foreground = textPrimary,
            BorderBrush = borderBrush,
            BorderThickness = new Thickness(1),
            CornerRadius = new CornerRadius(8),
            IsCancel = true
        };

        var iconCircle = new Border
        {
            Width = 28,
            Height = 28,
            CornerRadius = new CornerRadius(14),
            Background = dangerBrush,
            Child = new TextBlock
            {
                Text = "!",
                Foreground = Brushes.White,
                FontWeight = FontWeight.Bold,
                HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Center,
                VerticalAlignment = Avalonia.Layout.VerticalAlignment.Center
            }
        };

        var titleText = new TextBlock
        {
            Text = title,
            Foreground = textPrimary,
            FontSize = 16,
            FontWeight = FontWeight.SemiBold,
            VerticalAlignment = Avalonia.Layout.VerticalAlignment.Center
        };

        var header = new StackPanel
        {
            Orientation = Avalonia.Layout.Orientation.Horizontal,
            Spacing = 12,
            Children = { iconCircle, titleText }
        };

        var body = new TextBlock
        {
            Text = message,
            Foreground = textSecondary,
            TextWrapping = TextWrapping.Wrap
        };

        var buttons = new StackPanel
        {
            Orientation = Avalonia.Layout.Orientation.Horizontal,
            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right,
            Children = { cancelBtn, confirmBtn }
        };

        dlg.Content = new Border
        {
            Background = surfaceBrush,
            BorderBrush = borderBrush,
            BorderThickness = new Thickness(1),
            CornerRadius = new CornerRadius(12),
            BoxShadow = new BoxShadows(new BoxShadow { Blur = 12, Spread = 0, OffsetX = 0, OffsetY = 4, Color = Color.Parse("#20000000") }),
            Padding = new Thickness(16),
            Child = new StackPanel
            {
                Spacing = 12,
                Children = { header, body, buttons }
            }
        };

        cancelBtn.Click += (_, __) => { if (!tcs.Task.IsCompleted) tcs.TrySetResult(false); dlg.Close(); };
        confirmBtn.Click += (_, __) => { if (!tcs.Task.IsCompleted) tcs.TrySetResult(true); dlg.Close(); };
        dlg.Closed += (_, __) => { if (!tcs.Task.IsCompleted) tcs.TrySetResult(false); };

        dlg.WindowStartupLocation = owner is not null ? WindowStartupLocation.CenterOwner : WindowStartupLocation.CenterScreen;

        if (owner is not null)
            _ = dlg.ShowDialog(owner);
        else
            dlg.Show();

        return tcs.Task;
    }

    public Task ShowInfoAsync(string title, Dictionary<string, string> details)
    {
        var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        var dlg = new Window
        {
            CanResize = false,
            SystemDecorations = SystemDecorations.BorderOnly,
            SizeToContent = SizeToContent.WidthAndHeight,
            MinWidth = 400,
            MaxWidth = 600
        };

        var owner = (Application.Current?.ApplicationLifetime as IClassicDesktopStyleApplicationLifetime)?.MainWindow;
        var themeScope = owner as StyledElement ?? (StyledElement)dlg;

        var surfaceBrush = ThemeHelpers.GetBrush(themeScope, "CardBackgroundBrush", "#FFFFFF");
        var borderBrush = ThemeHelpers.GetBrush(themeScope, "BorderBrush", "#E5E7EB");
        var textPrimary = ThemeHelpers.GetBrush(themeScope, "TextPrimaryBrush", "#111827");
        var textSecondary = ThemeHelpers.GetBrush(themeScope, "TextSecondaryBrush", "#6B7280");
        var accentBrush = ThemeHelpers.GetBrush(themeScope, "AccentBrush", "#3B82F6");

        var closeBtn = new Button
        {
            Content = "Close",
            MinWidth = 92,
            Padding = new Thickness(12, 8),
            Background = accentBrush,
            Foreground = Brushes.White,
            BorderThickness = new Thickness(0),
            CornerRadius = new CornerRadius(8),
            IsDefault = true,
            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right
        };

        var titleText = new TextBlock
        {
            Text = title,
            Foreground = textPrimary,
            FontSize = 18,
            FontWeight = FontWeight.Bold,
            Margin = new Thickness(0, 0, 0, 16)
        };

        var detailsPanel = new StackPanel
        {
            Spacing = 12
        };

        foreach (var kvp in details)
        {
            var labelText = new TextBlock
            {
                Text = kvp.Key,
                Foreground = textSecondary,
                FontSize = 12,
                FontWeight = FontWeight.SemiBold
            };

            var valueText = new TextBlock
            {
                Text = kvp.Value,
                Foreground = textPrimary,
                FontSize = 14,
                TextWrapping = TextWrapping.Wrap
            };

            var detailGroup = new StackPanel
            {
                Spacing = 4,
                Children = { labelText, valueText }
            };

            detailsPanel.Children.Add(detailGroup);
        }

        var contentStack = new StackPanel
        {
            Spacing = 16,
            Children = { titleText, detailsPanel, closeBtn }
        };

        dlg.Content = new Border
        {
            Background = surfaceBrush,
            BorderBrush = borderBrush,
            BorderThickness = new Thickness(1),
            CornerRadius = new CornerRadius(12),
            BoxShadow = new BoxShadows(new BoxShadow { Blur = 12, Spread = 0, OffsetX = 0, OffsetY = 4, Color = Color.Parse("#20000000") }),
            Padding = new Thickness(24),
            Child = contentStack
        };

        closeBtn.Click += (_, __) => { if (!tcs.Task.IsCompleted) tcs.TrySetResult(true); dlg.Close(); };
        dlg.Closed += (_, __) => { if (!tcs.Task.IsCompleted) tcs.TrySetResult(true); };

        dlg.WindowStartupLocation = owner is not null ? WindowStartupLocation.CenterOwner : WindowStartupLocation.CenterScreen;

        if (owner is not null)
            _ = dlg.ShowDialog(owner);
        else
            dlg.Show();

        return tcs.Task;
    }

    public Task<bool> ShowConfirmAsync(string title, string message, string confirmText = "OK", string cancelText = "Cancel")
    {
        return ConfirmDeleteAsync(title, message);
    }

    public Task<string?> ShowInputDialogAsync(string title, string message, string placeholder = "", string initialValue = "")
    {
        var tcs = new TaskCompletionSource<string?>(TaskCreationOptions.RunContinuationsAsynchronously);
        var dlg = new Window
        {
            CanResize = false,
            SystemDecorations = SystemDecorations.BorderOnly,
            SizeToContent = SizeToContent.WidthAndHeight,
            MinWidth = 400,
            MaxWidth = 600
        };

        var owner = (Application.Current?.ApplicationLifetime as IClassicDesktopStyleApplicationLifetime)?.MainWindow;
        var themeScope = owner as StyledElement ?? (StyledElement)dlg;

        var surfaceBrush = ThemeHelpers.GetBrush(themeScope, "CardBackgroundBrush", "#FFFFFF");
        var borderBrush = ThemeHelpers.GetBrush(themeScope, "BorderBrush", "#E5E7EB");
        var textPrimary = ThemeHelpers.GetBrush(themeScope, "TextPrimaryBrush", "#111827");
        var textSecondary = ThemeHelpers.GetBrush(themeScope, "TextSecondaryBrush", "#6B7280");
        var accentBrush = ThemeHelpers.GetBrush(themeScope, "AccentBrush", "#3B82F6");

        var titleText = new TextBlock
        {
            Text = title,
            Foreground = textPrimary,
            FontSize = 18,
            FontWeight = FontWeight.Bold,
            Margin = new Thickness(0, 0, 0, 8)
        };

        var messageText = new TextBlock
        {
            Text = message,
            Foreground = textSecondary,
            FontSize = 14,
            TextWrapping = TextWrapping.Wrap,
            Margin = new Thickness(0, 0, 0, 16)
        };

        var inputBox = new TextBox
        {
            Watermark = placeholder,
            Text = initialValue,
            FontSize = 14,
            Margin = new Thickness(0, 0, 0, 16),
            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch
        };

        var sendBtn = new Button
        {
            Content = "Send Reset Link",
            MinWidth = 120,
            Padding = new Thickness(12, 8),
            Background = accentBrush,
            Foreground = Brushes.White,
            BorderThickness = new Thickness(0),
            CornerRadius = new CornerRadius(8),
            IsDefault = true,
            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right
        };

        var cancelBtn = new Button
        {
            Content = "Cancel",
            MinWidth = 92,
            Padding = new Thickness(12, 8),
            Background = ThemeHelpers.GetBrush(themeScope, "BorderBrush", "#E5E7EB"),
            Foreground = textPrimary,
            BorderThickness = new Thickness(0),
            CornerRadius = new CornerRadius(8),
            Margin = new Thickness(0, 0, 8, 0),
            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right
        };

        var buttons = new StackPanel
        {
            Orientation = Avalonia.Layout.Orientation.Horizontal,
            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right,
            Children = { cancelBtn, sendBtn }
        };

        dlg.Content = new Border
        {
            Background = surfaceBrush,
            BorderBrush = borderBrush,
            BorderThickness = new Thickness(1),
            CornerRadius = new CornerRadius(12),
            BoxShadow = new BoxShadows(new BoxShadow { Blur = 12, Spread = 0, OffsetX = 0, OffsetY = 4, Color = Color.Parse("#20000000") }),
            Padding = new Thickness(24),
            Child = new StackPanel
            {
                Spacing = 0,
                Children = { titleText, messageText, inputBox, buttons }
            }
        };

        sendBtn.Click += (_, __) => 
        { 
            if (!tcs.Task.IsCompleted) 
            {
                var value = inputBox.Text?.Trim() ?? string.Empty;
                tcs.TrySetResult(string.IsNullOrWhiteSpace(value) ? null : value);
            }
            dlg.Close(); 
        };
        
        cancelBtn.Click += (_, __) => 
        { 
            if (!tcs.Task.IsCompleted) tcs.TrySetResult(null); 
            dlg.Close(); 
        };
        
        dlg.Closed += (_, __) => { if (!tcs.Task.IsCompleted) tcs.TrySetResult(null); };

        dlg.WindowStartupLocation = owner is not null ? WindowStartupLocation.CenterOwner : WindowStartupLocation.CenterScreen;

        // Focus the input box when dialog opens
        inputBox.Focus();
        inputBox.SelectAll();

        if (owner is not null)
            _ = dlg.ShowDialog(owner);
        else
            dlg.Show();

        return tcs.Task;
    }

    public Task<string?> ShowChoiceDialogAsync(string title, string message, string option1Text, string option2Text)
    {
        var tcs = new TaskCompletionSource<string?>(TaskCreationOptions.RunContinuationsAsynchronously);
        var dlg = new Window
        {
            CanResize = false,
            SystemDecorations = SystemDecorations.BorderOnly,
            SizeToContent = SizeToContent.WidthAndHeight,
            MinWidth = 400,
            MaxWidth = 600
        };

        var owner = (Application.Current?.ApplicationLifetime as IClassicDesktopStyleApplicationLifetime)?.MainWindow;
        var themeScope = owner as StyledElement ?? (StyledElement)dlg;

        var surfaceBrush = ThemeHelpers.GetBrush(themeScope, "CardBackgroundBrush", "#FFFFFF");
        var borderBrush = ThemeHelpers.GetBrush(themeScope, "BorderBrush", "#E5E7EB");
        var textPrimary = ThemeHelpers.GetBrush(themeScope, "TextPrimaryBrush", "#111827");
        var textSecondary = ThemeHelpers.GetBrush(themeScope, "TextSecondaryBrush", "#6B7280");
        var accentBrush = ThemeHelpers.GetBrush(themeScope, "AccentBrush", "#3B82F6");

        // Close button (X) in top-right corner
        var closeBtn = new Button
        {
            Content = "✕",
            Width = 28,
            Height = 28,
            Padding = new Thickness(0),
            Background = Brushes.Transparent,
            Foreground = textSecondary,
            BorderThickness = new Thickness(0),
            CornerRadius = new CornerRadius(14),
            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right,
            VerticalAlignment = Avalonia.Layout.VerticalAlignment.Top,
            Cursor = new Avalonia.Input.Cursor(Avalonia.Input.StandardCursorType.Hand)
        };

        closeBtn.PointerEntered += (_, __) => closeBtn.Foreground = textPrimary;
        closeBtn.PointerExited += (_, __) => closeBtn.Foreground = textSecondary;

        // Header with title and close button
        var headerPanel = new Grid
        {
            ColumnDefinitions = new ColumnDefinitions("*,Auto"),
            Margin = new Thickness(0, 0, 0, 8)
        };

        var titleText = new TextBlock
        {
            Text = title,
            Foreground = textPrimary,
            FontSize = 18,
            FontWeight = FontWeight.Bold,
            VerticalAlignment = Avalonia.Layout.VerticalAlignment.Center
        };

        Grid.SetColumn(titleText, 0);
        Grid.SetColumn(closeBtn, 1);
        headerPanel.Children.Add(titleText);
        headerPanel.Children.Add(closeBtn);

        var messageText = new TextBlock
        {
            Text = message,
            Foreground = textSecondary,
            FontSize = 14,
            TextWrapping = TextWrapping.Wrap,
            Margin = new Thickness(0, 0, 0, 20)
        };

        var option1Btn = new Button
        {
            Content = option1Text,
            MinWidth = 140,
            Padding = new Thickness(16, 10),
            Background = accentBrush,
            Foreground = Brushes.White,
            BorderThickness = new Thickness(0),
            CornerRadius = new CornerRadius(8),
            Margin = new Thickness(0, 0, 8, 0),
            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch
        };

        var option2Btn = new Button
        {
            Content = option2Text,
            MinWidth = 140,
            Padding = new Thickness(16, 10),
            Background = ThemeHelpers.GetBrush(themeScope, "BorderBrush", "#E5E7EB"),
            Foreground = textPrimary,
            BorderThickness = new Thickness(0),
            CornerRadius = new CornerRadius(8),
            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch
        };

        var buttons = new StackPanel
        {
            Orientation = Avalonia.Layout.Orientation.Horizontal,
            HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Stretch,
            Children = { option1Btn, option2Btn }
        };

        dlg.Content = new Border
        {
            Background = surfaceBrush,
            BorderBrush = borderBrush,
            BorderThickness = new Thickness(1),
            CornerRadius = new CornerRadius(12),
            BoxShadow = new BoxShadows(new BoxShadow { Blur = 12, Spread = 0, OffsetX = 0, OffsetY = 4, Color = Color.Parse("#20000000") }),
            Padding = new Thickness(24),
            Child = new StackPanel
            {
                Spacing = 0,
                Children = { headerPanel, messageText, buttons }
            }
        };

        closeBtn.Click += (_, __) => 
        { 
            if (!tcs.Task.IsCompleted) tcs.TrySetResult(null); 
            dlg.Close(); 
        };

        option1Btn.Click += (_, __) => 
        { 
            if (!tcs.Task.IsCompleted) tcs.TrySetResult(option1Text); 
            dlg.Close(); 
        };
        
        option2Btn.Click += (_, __) => 
        { 
            if (!tcs.Task.IsCompleted) tcs.TrySetResult(option2Text); 
            dlg.Close(); 
        };
        
        dlg.Closed += (_, __) => { if (!tcs.Task.IsCompleted) tcs.TrySetResult(null); };

        dlg.WindowStartupLocation = owner is not null ? WindowStartupLocation.CenterOwner : WindowStartupLocation.CenterScreen;

        if (owner is not null)
            _ = dlg.ShowDialog(owner);
        else
            dlg.Show();

        return tcs.Task;
    }

    private Window? GetMainWindow()
    {
        return (Application.Current?.ApplicationLifetime as IClassicDesktopStyleApplicationLifetime)?.MainWindow;
    }
}
