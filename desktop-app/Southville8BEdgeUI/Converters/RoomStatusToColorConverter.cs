using System;
using System.Globalization;
using Avalonia;
using Avalonia.Styling;
using Avalonia.Data.Converters;
using Avalonia.Media;

namespace Southville8BEdgeUI.Converters;

public class RoomStatusToColorConverter : IValueConverter
{
    public static readonly RoomStatusToColorConverter Instance = new();
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        // Resolve themed brushes so colors adapt to light/dark modes
        static IBrush ResolveBrush(string resourceKey, string fallbackHex)
        {
            var app = Application.Current;
            if (app != null)
            {
                if (app.TryGetResource(resourceKey, app.ActualThemeVariant, out var resource)
                    && resource is IBrush resolvedBrush)
                {
                    return resolvedBrush;
                }
            }
            return new SolidColorBrush(Color.Parse(fallbackHex));
        }

        return value?.ToString()?.ToLower() switch
        {
            // Use soft status brushes defined in ThemeColors.axaml
            "available" => ResolveBrush("SuccessSoftBrush", "#E8F5E9"),
            "occupied" => ResolveBrush("WarningSoftBrush", "#FFF3E0"),
            "maintenance" => ResolveBrush("DangerSoftBrush", "#FFEBEE"),
            _ => ResolveBrush("CardBackgroundBrush", "#FFFFFF")
        };
    }

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}
