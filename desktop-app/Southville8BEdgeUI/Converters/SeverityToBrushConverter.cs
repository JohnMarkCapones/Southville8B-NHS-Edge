using Avalonia.Data.Converters;
using System;
using System.Globalization;
using Avalonia.Media;
using Southville8BEdgeUI.ViewModels.Teacher;

namespace Southville8BEdgeUI.Converters;

public class SeverityToBrushConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var severity = value as NotificationSeverity? ?? NotificationSeverity.Info;
        return severity switch
        {
            NotificationSeverity.Warning => SolidColorBrush.Parse("#F59E0B"),
            NotificationSeverity.Success => SolidColorBrush.Parse("#10B981"),
            _ => SolidColorBrush.Parse("#3B82F6")
        };
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture) => throw new NotSupportedException();
}
