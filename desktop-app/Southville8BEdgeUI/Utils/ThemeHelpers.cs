using Avalonia;
using Avalonia.Media;
using Avalonia.Styling;

namespace Southville8BEdgeUI.Utils;

public static class ThemeHelpers
{
    public static IBrush GetBrush(StyledElement scope, string key, string fallbackHex)
    {
        var theme = (scope as IThemeVariantHost)?.ActualThemeVariant ?? ThemeVariant.Default;

        if (Application.Current?.TryGetResource(key, theme, out var found) == true && found is IBrush brush)
            return brush;

        return new SolidColorBrush(Color.Parse(fallbackHex));
    }
}
